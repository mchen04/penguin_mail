import logging
import threading
import uuid as uuid_mod

from django.db.models import Q
from django.utils.timezone import now
from ninja import Router
from ninja.errors import HttpError

from penguin_mail.models import Account, Email, Recipient, Label
from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.pagination import paginate_queryset
from penguin_mail.api.schemas.email import (
    EmailOut,
    EmailCreateIn,
    EmailUpdateIn,
    BulkOpIn,
    LabelOpIn,
)
from penguin_mail.api.schemas.auth import SuccessOut

router = Router(auth=JWTAuth())

logger = logging.getLogger(__name__)

SYNC_STALENESS_SECONDS = 300  # 5 minutes


def _base_qs(user):
    return (
        Email.objects
        .filter(account__user=user)
        .select_related("account", "reply_to", "forwarded_from")
        .prefetch_related("recipients", "attachments", "labels")
    )


def _strip_html(html: str, max_length: int = 200) -> str:
    import re
    from html import unescape
    text = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)
    text = re.sub(r"<(style|script)[^>]*>.*?</(style|script)>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = unescape(text)
    # Remove zero-width / invisible Unicode characters common in email spam traps
    text = re.sub(r'[\u034f\u200b-\u200f\u2028\u2029\u00ad\uFEFF]', '', text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]


def _create_recipients(email, addresses, kind):
    for i, addr in enumerate(addresses):
        Recipient.objects.create(
            email=email,
            address=addr.email,
            name=addr.name,
            kind=kind,
            order=i,
        )


@router.get("/", response=dict)
def list_emails(
    request,
    folder: str = None,
    accountId: str = None,
    isRead: bool = None,
    isStarred: bool = None,
    hasAttachment: bool = None,
    search: str = None,
    threadId: str = None,
    labelIds: str = None,
    page: int = 1,
    pageSize: int = 50,
):
    from penguin_mail.services.sync import sync_all_folders
    accounts_to_check = (
        Account.objects.filter(uuid=accountId, user=request.auth)
        if accountId
        else Account.objects.filter(user=request.auth)
    )
    for account in accounts_to_check:
        needs_sync = (
            account.last_sync_at is None or
            (now() - account.last_sync_at).total_seconds() > SYNC_STALENESS_SECONDS
        )
        if needs_sync:
            t = threading.Thread(target=sync_all_folders, args=(account,), daemon=True)
            t.start()

    qs = _base_qs(request.auth)

    if folder:
        qs = qs.filter(folder=folder)
    if accountId:
        qs = qs.filter(account__uuid=accountId)
    if isRead is not None:
        qs = qs.filter(is_read=isRead)
    if isStarred is not None:
        qs = qs.filter(is_starred=isStarred)
    if hasAttachment is not None:
        qs = qs.filter(has_attachment=hasAttachment)
    if search:
        qs = qs.filter(
            Q(subject__icontains=search) |
            Q(body__icontains=search) |
            Q(sender_name__icontains=search) |
            Q(sender_email__icontains=search)
        )
    if threadId:
        qs = qs.filter(thread_id=threadId)
    if labelIds:
        ids = labelIds.split(",")
        for lid in ids:
            qs = qs.filter(labels__uuid=lid)

    result = paginate_queryset(qs, page, pageSize)
    return {
        "data": [EmailOut.from_model(e) for e in result["items"]],
        **result["pagination"],
    }


@router.post("/", response={201: EmailOut})
def create_email(request, payload: EmailCreateIn):
    user = request.auth
    try:
        account = Account.objects.get(uuid=payload.accountId, user=user)
    except Account.DoesNotExist:
        raise HttpError(404, "Account not found")

    # Determine sender
    sender_name = account.display_name or account.name
    sender_email = account.email

    email = Email.objects.create(
        account=account,
        subject=payload.subject,
        body=payload.body,
        preview=_strip_html(payload.body),
        sender_name=sender_name,
        sender_email=sender_email,
        folder="sent",
        thread_id=uuid_mod.uuid4(),
        has_attachment=False,
    )

    # Handle reply/forward references
    if payload.replyToId:
        try:
            reply_to = Email.objects.get(uuid=payload.replyToId, account__user=user)
            email.reply_to = reply_to
            email.thread_id = reply_to.thread_id or reply_to.uuid
            email.save(update_fields=["reply_to", "thread_id"])
        except Email.DoesNotExist:
            pass

    if payload.forwardedFromId:
        try:
            fwd = Email.objects.get(uuid=payload.forwardedFromId, account__user=user)
            email.forwarded_from = fwd
            email.save(update_fields=["forwarded_from"])
        except Email.DoesNotExist:
            pass

    if payload.scheduledSendAt:
        email.scheduled_send_at = payload.scheduledSendAt
        email.folder = "scheduled"
        email.save(update_fields=["scheduled_send_at", "folder"])

    # Create recipients
    _create_recipients(email, payload.to, "TO")
    _create_recipients(email, payload.cc, "CC")
    _create_recipients(email, payload.bcc, "BCC")

    # Send via SMTP (skip for scheduled sends)
    if not payload.scheduledSendAt:
        from penguin_mail.services.smtp import send_email as smtp_send
        try:
            smtp_send(
                account=account,
                recipients_to=[r.email for r in payload.to],
                recipients_cc=[r.email for r in payload.cc],
                recipients_bcc=[r.email for r in payload.bcc],
                subject=payload.subject,
                body_html=payload.body,
            )
        except Exception as e:
            email.delete()
            raise HttpError(502, f"Failed to send email: {e}")

    # Reload with prefetched data
    email = _base_qs(user).get(pk=email.pk)
    return 201, EmailOut.from_model(email)


# Literal paths MUST be defined before /{email_id} to avoid parameter capture
@router.post("/draft", response={201: EmailOut})
def create_draft(request, payload: EmailCreateIn):
    user = request.auth
    try:
        account = Account.objects.get(uuid=payload.accountId, user=user)
    except Account.DoesNotExist:
        raise HttpError(404, "Account not found")

    sender_name = account.display_name or account.name

    email = Email.objects.create(
        account=account,
        subject=payload.subject,
        body=payload.body,
        preview=_strip_html(payload.body),
        sender_name=sender_name,
        sender_email=account.email,
        folder="drafts",
        is_draft=True,
        thread_id=uuid_mod.uuid4(),
    )

    _create_recipients(email, payload.to, "TO")
    _create_recipients(email, payload.cc, "CC")
    _create_recipients(email, payload.bcc, "BCC")

    email = _base_qs(user).get(pk=email.pk)
    return 201, EmailOut.from_model(email)


def _fire_imap_op(op: str, email_obj, folder_map: dict) -> None:
    """Fire an IMAP write operation for a single email in a background thread."""
    from penguin_mail.services.imap import (
        imap_mark_read, imap_mark_unread, imap_move, imap_delete,
    )
    if not email_obj.imap_uid:
        return
    account = email_obj.account
    uid = email_obj.imap_uid
    src = email_obj.imap_folder or 'INBOX'
    try:
        if op == 'markRead':
            imap_mark_read(account, uid, src)
        elif op == 'markUnread':
            imap_mark_unread(account, uid, src)
        elif op == 'archive':
            dst = folder_map.get('archive', 'Archive')
            imap_move(account, uid, src, dst)
        elif op == 'delete':
            dst = folder_map.get('trash', 'Trash')
            imap_move(account, uid, src, dst)
        elif op == 'deletePermanent':
            imap_delete(account, uid, src)
        elif op == 'moveSpam':
            dst = folder_map.get('spam', 'Junk')
            imap_move(account, uid, src, dst)
    except Exception:
        logger.exception("IMAP op %s failed for email %s", op, email_obj.uuid)


@router.post("/bulk", response=SuccessOut)
def bulk_operation(request, payload: BulkOpIn):
    from penguin_mail.services.imap import get_imap_folder_map
    user = request.auth
    emails = Email.objects.filter(uuid__in=payload.ids, account__user=user)

    op = payload.operation
    imap_op = None

    if op == "markRead":
        emails.update(is_read=True)
        imap_op = 'markRead'
    elif op == "markUnread":
        emails.update(is_read=False)
        imap_op = 'markUnread'
    elif op == "star":
        emails.update(is_starred=True)
    elif op == "unstar":
        emails.update(is_starred=False)
    elif op == "archive":
        emails.update(folder="archive")
        imap_op = 'archive'
    elif op == "delete":
        emails.update(folder="trash")
        imap_op = 'delete'
    elif op == "deletePermanent":
        email_list = list(emails)
        emails.delete()
        imap_op = 'deletePermanent'
        # For permanent delete we already consumed the queryset; fire IMAP ops below
        _accounts_seen = {}
        for email_obj in email_list:
            if email_obj.imap_uid:
                acct_id = email_obj.account_id
                if acct_id not in _accounts_seen:
                    try:
                        _accounts_seen[acct_id] = get_imap_folder_map(email_obj.account)
                    except Exception:
                        _accounts_seen[acct_id] = {}
                fmap = _accounts_seen[acct_id]
                t = threading.Thread(target=_fire_imap_op, args=('deletePermanent', email_obj, fmap), daemon=True)
                t.start()
        return SuccessOut()
    elif op == "move" and payload.folder:
        emails.update(folder=payload.folder)
        if payload.folder == 'spam':
            imap_op = 'moveSpam'
    elif op == "addLabel" and payload.labelIds:
        labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
        for email in emails:
            email.labels.add(*labels)
    elif op == "removeLabel" and payload.labelIds:
        labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
        for email in emails:
            email.labels.remove(*labels)

    if imap_op:
        _accounts_seen = {}
        for email_obj in emails:
            if email_obj.imap_uid:
                acct_id = email_obj.account_id
                if acct_id not in _accounts_seen:
                    try:
                        _accounts_seen[acct_id] = get_imap_folder_map(email_obj.account)
                    except Exception:
                        _accounts_seen[acct_id] = {}
                fmap = _accounts_seen[acct_id]
                t = threading.Thread(target=_fire_imap_op, args=(imap_op, email_obj, fmap), daemon=True)
                t.start()

    return SuccessOut()


# Parameterized routes after literal ones
@router.get("/{email_id}", response=EmailOut)
def get_email(request, email_id: str):
    try:
        email = _base_qs(request.auth).get(uuid=email_id)
    except Email.DoesNotExist:
        raise HttpError(404, "Not found")
    return EmailOut.from_model(email)


@router.patch("/{email_id}", response=EmailOut)
def update_email(request, email_id: str, payload: EmailUpdateIn):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        raise HttpError(404, "Not found")

    if payload.isRead is not None:
        email.is_read = payload.isRead
    if payload.isStarred is not None:
        email.is_starred = payload.isStarred
    if payload.folder is not None:
        email.folder = payload.folder
    if payload.snoozeUntil is not None:
        email.snooze_until = payload.snoozeUntil
    if payload.snoozedFromFolder is not None:
        email.snoozed_from_folder = payload.snoozedFromFolder
    email.save()

    if payload.labels is not None:
        label_objs = Label.objects.filter(uuid__in=payload.labels, user=user)
        email.labels.set(label_objs)

    email = _base_qs(user).get(pk=email.pk)
    return EmailOut.from_model(email)


@router.delete("/{email_id}", response=SuccessOut)
def delete_email(request, email_id: str):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        raise HttpError(404, "Not found")

    email.folder = "trash"
    email.save(update_fields=["folder"])
    return SuccessOut()


@router.delete("/{email_id}/permanent", response=SuccessOut)
def delete_email_permanent(request, email_id: str):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        raise HttpError(404, "Not found")

    email.delete()
    return SuccessOut()


@router.post("/{email_id}/labels", response=SuccessOut)
def add_labels(request, email_id: str, payload: LabelOpIn):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        raise HttpError(404, "Not found")

    labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
    email.labels.add(*labels)
    return SuccessOut()


@router.delete("/{email_id}/labels", response=SuccessOut)
def remove_labels(request, email_id: str, payload: LabelOpIn):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        raise HttpError(404, "Not found")

    labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
    email.labels.remove(*labels)
    return SuccessOut()
