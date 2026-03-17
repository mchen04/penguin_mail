import logging
import re

from django.utils import timezone

from penguin_mail.models import Email, Recipient

logger = logging.getLogger(__name__)


def sync_account_inbox(account) -> int:
    """Fetch new emails from IMAP and save to DB. Returns count of new emails saved."""
    from penguin_mail.services.imap import fetch_emails

    # Re-read last_sync_at to guard against concurrent sync requests
    account.refresh_from_db(fields=['last_sync_at'])

    emails = fetch_emails(account, folder='INBOX', since=account.last_sync_at, limit=50)

    saved = 0
    for data in emails:
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

        preview_text = re.sub(r'<[^>]+>', '', data.get('body', ''))
        preview_text = re.sub(r'\s+', ' ', preview_text).strip()[:200]

        email_obj = Email.objects.create(
            account=account,
            subject=data['subject'],
            body=data['body'],
            preview=preview_text,
            sender_name=data['sender_name'],
            sender_email=data['sender_email'],
            folder='inbox',
            is_read=data.get('is_read', False),
            has_attachment=data.get('has_attachment', False),
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

    account.last_sync_at = timezone.now()
    account.save(update_fields=['last_sync_at'])

    return saved
