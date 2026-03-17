import logging
import re

from django.utils import timezone

from penguin_mail.models import Email, Recipient

logger = logging.getLogger(__name__)

# Map IMAP folder logical names to local folder values
_IMAP_TO_LOCAL_FOLDER = {
    'INBOX': 'inbox',
    'sent': 'sent',
    'drafts': 'drafts',
    'spam': 'spam',
    'trash': 'trash',
    'archive': 'archive',
}


def sync_account_folder(account, imap_folder: str, local_folder: str, limit: int = 50) -> int:
    """Fetch new emails from a specific IMAP folder and save to DB. Returns count of new emails saved."""
    from penguin_mail.services.imap import fetch_emails

    emails = fetch_emails(account, folder=imap_folder, since=account.last_sync_at, limit=limit)

    saved = 0
    for data in emails:
        imap_uid = data.get('imap_uid')

        # Deduplicate by IMAP UID first (most reliable)
        if imap_uid and Email.objects.filter(account=account, imap_uid=imap_uid, imap_folder=imap_folder).exists():
            continue

        message_id = data.get('message_id', '')
        if message_id and Email.objects.filter(account=account, body__contains=message_id).exists():
            continue

        if Email.objects.filter(
            account=account,
            sender_email=data['sender_email'],
            subject=data['subject'],
            created_at__date=data['date'].date() if data.get('date') else None,
        ).exists():
            continue

        from html import unescape
        raw_body = data.get('body', '')
        preview_text = re.sub(r'<!--.*?-->', '', raw_body, flags=re.DOTALL)
        preview_text = re.sub(r'<(style|script)[^>]*>.*?</(style|script)>', '', preview_text, flags=re.DOTALL | re.IGNORECASE)
        preview_text = re.sub(r'<[^>]+>', '', preview_text)
        preview_text = unescape(preview_text)
        preview_text = re.sub(r'[\u034f\u200b-\u200f\u2028\u2029\u00ad\uFEFF]', '', preview_text)
        preview_text = re.sub(r'\s+', ' ', preview_text).strip()[:200]

        email_obj = Email.objects.create(
            account=account,
            subject=data['subject'],
            body=data['body'],
            preview=preview_text,
            sender_name=data['sender_name'],
            sender_email=data['sender_email'],
            folder=local_folder,
            is_read=data.get('is_read', False),
            has_attachment=data.get('has_attachment', False),
            imap_uid=imap_uid,
            imap_folder=imap_folder,
        )

        for i, r in enumerate(data.get('recipients_to', [])):
            Recipient.objects.create(
                email=email_obj, address=r['address'], name=r.get('name', ''),
                kind='TO', order=i,
            )
        for i, r in enumerate(data.get('recipients_cc', [])):
            Recipient.objects.create(
                email=email_obj, address=r['address'], name=r.get('name', ''),
                kind='CC', order=i,
            )

        saved += 1

    return saved


def sync_account_inbox(account) -> int:
    """Fetch new emails from INBOX and save to DB. Returns count of new emails saved."""
    # Re-read last_sync_at to guard against concurrent sync requests
    account.refresh_from_db(fields=['last_sync_at'])
    saved = sync_account_folder(account, 'INBOX', 'inbox')
    account.last_sync_at = timezone.now()
    account.save(update_fields=['last_sync_at'])
    return saved


def sync_all_folders(account) -> dict:
    """Sync INBOX plus discovered Sent/Drafts/Spam/Trash/Archive folders. Returns counts per folder."""
    from penguin_mail.services.imap import get_imap_folder_map

    # Re-read last_sync_at to guard against concurrent sync requests
    account.refresh_from_db(fields=['last_sync_at'])

    counts = {}
    # Always sync INBOX
    try:
        counts['inbox'] = sync_account_folder(account, 'INBOX', 'inbox')
    except Exception:
        logger.exception("Sync failed for account %s folder INBOX", account.uuid)
        counts['inbox'] = 0

    # Discover and sync other folders
    try:
        folder_map = get_imap_folder_map(account)
    except Exception:
        logger.exception("Failed to get IMAP folder map for account %s", account.uuid)
        folder_map = {}

    for local_folder, imap_folder_path in folder_map.items():
        if local_folder not in ('sent', 'drafts', 'spam', 'trash', 'archive'):
            continue
        try:
            counts[local_folder] = sync_account_folder(account, imap_folder_path, local_folder)
        except Exception:
            logger.exception("Sync failed for account %s folder %s", account.uuid, imap_folder_path)
            counts[local_folder] = 0

    account.last_sync_at = timezone.now()
    account.save(update_fields=['last_sync_at'])

    return counts
