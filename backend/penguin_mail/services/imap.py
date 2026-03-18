import imaplib
import email as email_lib
import ssl
from datetime import datetime
from email.header import decode_header
from email.utils import parseaddr, parsedate_to_datetime
from typing import Optional


def _decode_header_value(value: str) -> str:
    if not value:
        return ''
    decoded_parts = decode_header(value)
    result = []
    for part, charset in decoded_parts:
        if isinstance(part, bytes):
            result.append(part.decode(charset or 'utf-8', errors='replace'))
        else:
            result.append(part)
    return ''.join(result)


def _get_body(msg: email_lib.message.Message) -> tuple[str, str]:
    """Extract HTML and plain text body from a message. Returns (html, plain).
    Inline CID images are embedded as base64 data URIs so they render without
    a separate attachment-serving endpoint."""
    import base64

    html_body = ''
    plain_body = ''
    # Map Content-ID → data URI for inline images
    cid_map: dict[str, str] = {}

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = str(part.get('Content-Disposition', ''))
            content_id = part.get('Content-ID', '')

            # Collect inline images: any image part with a Content-ID, regardless of
            # Content-Disposition (some clients mark cid-referenced images as 'attachment')
            if content_id and content_type.startswith('image/'):
                payload = part.get_payload(decode=True)
                if payload:
                    cid = content_id.strip('<>').strip()
                    b64 = base64.b64encode(payload).decode('ascii')
                    cid_map[cid] = f'data:{content_type};base64,{b64}'
                continue

            if 'attachment' in disposition:
                continue

            if content_type == 'text/html':
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or 'utf-8'
                    html_body = payload.decode(charset, errors='replace')
            elif content_type == 'text/plain':
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or 'utf-8'
                    plain_body = payload.decode(charset, errors='replace')
    else:
        content_type = msg.get_content_type()
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or 'utf-8'
            text = payload.decode(charset, errors='replace')
            if content_type == 'text/html':
                html_body = text
            else:
                plain_body = text

    # Replace cid: references in HTML with embedded data URIs
    if html_body and cid_map:
        import re
        def replace_cid(m):
            cid = m.group(1).strip()
            return f'src="{cid_map.get(cid, "cid:" + cid)}"'
        html_body = re.sub(r'src=["\']cid:([^"\']+)["\']', replace_cid, html_body)

    return html_body, plain_body


def _has_attachments(msg: email_lib.message.Message) -> bool:
    if not msg.is_multipart():
        return False
    for part in msg.walk():
        disposition = str(part.get('Content-Disposition', ''))
        if 'attachment' in disposition:
            return True
    return False


def _parse_recipients(msg: email_lib.message.Message, header: str) -> list[dict]:
    raw = msg.get_all(header, [])
    recipients = []
    for entry in raw:
        decoded = _decode_header_value(entry)
        # May contain multiple comma-separated addresses
        for addr_str in decoded.split(','):
            addr_str = addr_str.strip()
            if not addr_str:
                continue
            name, address = parseaddr(addr_str)
            if address:
                recipients.append({'name': name, 'address': address})
    return recipients


def _open_connection(account):
    """Open and return an authenticated IMAP4_SSL connection."""
    password = account.get_imap_password()
    context = ssl.create_default_context()
    conn = imaplib.IMAP4_SSL(account.imap_host, account.imap_port, ssl_context=context)
    conn.login(account.email, password)
    return conn


def fetch_emails(
    account,
    folder: str = 'INBOX',
    since: Optional[datetime] = None,
    limit: int = 50,
) -> list[dict]:
    """Fetch emails from IMAP using UIDs. Returns list of parsed email dicts."""
    conn = _open_connection(account)
    try:
        conn.select(folder, readonly=True)

        if since:
            date_str = since.strftime('%d-%b-%Y')
            _, uid_data = conn.uid('search', None, f'(SINCE {date_str})')
        else:
            _, uid_data = conn.uid('search', None, 'ALL')

        uids = uid_data[0].split()
        if not uids:
            return []

        # Take the most recent N
        uids = uids[-limit:]

        emails = []
        for uid_bytes in uids:
            _, msg_data = conn.uid('fetch', uid_bytes, '(RFC822 FLAGS)')
            if not msg_data or not msg_data[0]:
                continue

            # msg_data may be [(b'... FLAGS (\\Seen)', raw_bytes), b')'] or similar
            raw = None
            flags_str = ''
            for part in msg_data:
                if isinstance(part, tuple):
                    flags_str = part[0].decode('utf-8', errors='replace') if isinstance(part[0], bytes) else str(part[0])
                    raw = part[1]
                    break

            if not raw:
                continue

            msg = email_lib.message_from_bytes(raw)
            is_read = r'\Seen' in flags_str

            html_body, plain_body = _get_body(msg)
            body = html_body or f'<p>{plain_body}</p>'

            sender_name, sender_email = parseaddr(_decode_header_value(msg.get('From', '')))

            try:
                date = parsedate_to_datetime(msg.get('Date', ''))
            except Exception:
                date = datetime.now()

            message_id = msg.get('Message-ID', '')

            emails.append({
                'imap_uid': int(uid_bytes),
                'message_id': message_id,
                'subject': _decode_header_value(msg.get('Subject', '')),
                'body': body,
                'sender_name': sender_name,
                'sender_email': sender_email,
                'date': date,
                'is_read': is_read,
                'has_attachment': _has_attachments(msg),
                'recipients_to': _parse_recipients(msg, 'To'),
                'recipients_cc': _parse_recipients(msg, 'Cc'),
            })

        return emails
    finally:
        try:
            conn.logout()
        except Exception:
            pass


def get_imap_folder_map(account) -> dict:
    """
    Return a dict mapping logical folder names to IMAP folder paths.
    Keys: 'trash', 'sent', 'drafts', 'spam', 'archive'
    Uses IMAP special-use attributes (RFC 6154) or common name patterns.
    """
    conn = _open_connection(account)
    try:
        _, folders = conn.list('""', '*')
    finally:
        try:
            conn.logout()
        except Exception:
            pass

    result = {}
    special_use_map = {
        r'\\trash': 'trash',
        r'\\sent': 'sent',
        r'\\drafts': 'drafts',
        r'\\junk': 'spam',
        r'\\spam': 'spam',
        r'\\archive': 'archive',
        r'\\all': 'archive',
    }
    name_patterns = {
        'trash': 'trash',
        'deleted': 'trash',
        'sent': 'sent',
        'sent items': 'sent',
        'sent mail': 'sent',
        'drafts': 'drafts',
        'draft': 'drafts',
        'junk': 'spam',
        'spam': 'spam',
        'bulk mail': 'spam',
        'archive': 'archive',
        'all mail': 'archive',
    }

    for folder_line in folders:
        if not folder_line:
            continue
        decoded = folder_line.decode('utf-8', errors='replace') if isinstance(folder_line, bytes) else folder_line
        # Format: (\Attribute ...) "/" "folder name"
        parts = decoded.split('"')
        if len(parts) < 3:
            continue
        attributes = parts[0].lower()
        folder_path = parts[-1].strip().strip('"')

        for attr, key in special_use_map.items():
            if attr in attributes and key not in result:
                result[key] = folder_path
                break

    # Fallback: match by name if special-use didn't find everything
    if len(result) < 5:
        for folder_line in folders:
            if not folder_line:
                continue
            decoded = folder_line.decode('utf-8', errors='replace') if isinstance(folder_line, bytes) else folder_line
            parts = decoded.split('"')
            if len(parts) < 3:
                continue
            folder_path = parts[-1].strip().strip('"')
            name_lower = folder_path.lower().rstrip('/').split('/')[-1]
            for pattern, key in name_patterns.items():
                if pattern == name_lower and key not in result:
                    result[key] = folder_path
                    break

    return result


def imap_mark_read(account, uid: int, folder: str) -> None:
    conn = _open_connection(account)
    try:
        conn.select(folder)
        conn.uid('store', str(uid), '+FLAGS', r'(\Seen)')
    finally:
        try:
            conn.logout()
        except Exception:
            pass


def imap_mark_unread(account, uid: int, folder: str) -> None:
    conn = _open_connection(account)
    try:
        conn.select(folder)
        conn.uid('store', str(uid), '-FLAGS', r'(\Seen)')
    finally:
        try:
            conn.logout()
        except Exception:
            pass


def imap_move(account, uid: int, src_folder: str, dst_folder: str) -> None:
    """Move a message by UID: COPY to dst, mark \\Deleted in src, EXPUNGE."""
    conn = _open_connection(account)
    try:
        conn.select(src_folder)
        conn.uid('copy', str(uid), dst_folder)
        conn.uid('store', str(uid), '+FLAGS', r'(\Deleted)')
        conn.expunge()
    finally:
        try:
            conn.logout()
        except Exception:
            pass


def imap_delete(account, uid: int, folder: str) -> None:
    """Permanently delete a message by UID (mark \\Deleted + EXPUNGE)."""
    conn = _open_connection(account)
    try:
        conn.select(folder)
        conn.uid('store', str(uid), '+FLAGS', r'(\Deleted)')
        conn.expunge()
    finally:
        try:
            conn.logout()
        except Exception:
            pass


def test_imap_connection(host: str, port: int, email_addr: str, password: str) -> None:
    """Test IMAP connection. Raises on failure."""
    context = ssl.create_default_context()
    conn = imaplib.IMAP4_SSL(host, port, ssl_context=context)
    try:
        conn.login(email_addr, password)
    finally:
        try:
            conn.logout()
        except Exception:
            pass
