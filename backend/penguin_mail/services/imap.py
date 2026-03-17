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
    """Extract HTML and plain text body from a message. Returns (html, plain)."""
    html_body = ''
    plain_body = ''

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = str(part.get('Content-Disposition', ''))
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


def fetch_emails(
    account,
    folder: str = 'INBOX',
    since: Optional[datetime] = None,
    limit: int = 50,
) -> list[dict]:
    """Fetch emails from IMAP. Returns list of parsed email dicts."""
    password = account.get_imap_password()
    context = ssl.create_default_context()

    conn = imaplib.IMAP4_SSL(account.imap_host, account.imap_port, ssl_context=context)
    try:
        conn.login(account.email, password)
        conn.select(folder, readonly=True)

        if since:
            date_str = since.strftime('%d-%b-%Y')
            _, msg_nums = conn.search(None, f'(SINCE {date_str})')
        else:
            _, msg_nums = conn.search(None, 'ALL')

        ids = msg_nums[0].split()
        if not ids:
            return []

        # Take the most recent N
        ids = ids[-limit:]

        emails = []
        for msg_id in ids:
            _, msg_data = conn.fetch(msg_id, '(RFC822)')
            if not msg_data or not msg_data[0]:
                continue
            raw = msg_data[0][1]
            msg = email_lib.message_from_bytes(raw)

            html_body, plain_body = _get_body(msg)
            body = html_body or f'<p>{plain_body}</p>'

            sender_name, sender_email = parseaddr(_decode_header_value(msg.get('From', '')))

            try:
                date = parsedate_to_datetime(msg.get('Date', ''))
            except Exception:
                date = datetime.now()

            message_id = msg.get('Message-ID', '')

            emails.append({
                'message_id': message_id,
                'subject': _decode_header_value(msg.get('Subject', '')),
                'body': body,
                'sender_name': sender_name,
                'sender_email': sender_email,
                'date': date,
                'is_read': False,
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
