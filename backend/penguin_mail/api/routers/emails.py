import uuid as uuid_mod

from django.db.models import Q
from ninja import Router

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


def _base_qs(user):
    return (
        Email.objects
        .filter(account__user=user)
        .select_related("account", "reply_to", "forwarded_from")
        .prefetch_related("recipients", "attachments", "labels")
    )


def _strip_html(html: str, max_length: int = 200) -> str:
    import re
    text = re.sub(r"<[^>]+>", "", html)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]


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


@router.get("/{email_id}", response=EmailOut)
def get_email(request, email_id: str):
    try:
        email = _base_qs(request.auth).get(uuid=email_id)
    except Email.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    return EmailOut.from_model(email)


@router.post("/", response={201: EmailOut})
def create_email(request, payload: EmailCreateIn):
    user = request.auth
    try:
        account = Account.objects.get(uuid=payload.accountId, user=user)
    except Account.DoesNotExist:
        return router.create_response(request, {"detail": "Account not found"}, status=404)

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

    # Reload with prefetched data
    email = _base_qs(user).get(pk=email.pk)
    return 201, EmailOut.from_model(email)


@router.post("/draft", response={201: EmailOut})
def create_draft(request, payload: EmailCreateIn):
    user = request.auth
    try:
        account = Account.objects.get(uuid=payload.accountId, user=user)
    except Account.DoesNotExist:
        return router.create_response(request, {"detail": "Account not found"}, status=404)

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


@router.patch("/{email_id}", response=EmailOut)
def update_email(request, email_id: str, payload: EmailUpdateIn):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    if payload.isRead is not None:
        email.is_read = payload.isRead
    if payload.isStarred is not None:
        email.is_starred = payload.isStarred
    if payload.folder is not None:
        email.folder = payload.folder
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
        return router.create_response(request, {"detail": "Not found"}, status=404)

    email.folder = "trash"
    email.save(update_fields=["folder"])
    return SuccessOut()


@router.delete("/{email_id}/permanent", response=SuccessOut)
def delete_email_permanent(request, email_id: str):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    email.delete()
    return SuccessOut()


@router.post("/bulk", response=SuccessOut)
def bulk_operation(request, payload: BulkOpIn):
    user = request.auth
    emails = Email.objects.filter(uuid__in=payload.ids, account__user=user)

    op = payload.operation
    if op == "markRead":
        emails.update(is_read=True)
    elif op == "markUnread":
        emails.update(is_read=False)
    elif op == "star":
        emails.update(is_starred=True)
    elif op == "unstar":
        emails.update(is_starred=False)
    elif op == "archive":
        emails.update(folder="archive")
    elif op == "delete":
        emails.update(folder="trash")
    elif op == "deletePermanent":
        emails.delete()
    elif op == "move" and payload.folder:
        emails.update(folder=payload.folder)
    elif op == "addLabel" and payload.labelIds:
        labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
        for email in emails:
            email.labels.add(*labels)
    elif op == "removeLabel" and payload.labelIds:
        labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
        for email in emails:
            email.labels.remove(*labels)

    return SuccessOut()


@router.post("/{email_id}/labels", response=SuccessOut)
def add_labels(request, email_id: str, payload: LabelOpIn):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
    email.labels.add(*labels)
    return SuccessOut()


@router.delete("/{email_id}/labels", response=SuccessOut)
def remove_labels(request, email_id: str, payload: LabelOpIn):
    user = request.auth
    try:
        email = Email.objects.get(uuid=email_id, account__user=user)
    except Email.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    labels = Label.objects.filter(uuid__in=payload.labelIds, user=user)
    email.labels.remove(*labels)
    return SuccessOut()


def _create_recipients(email, addresses, kind):
    for i, addr in enumerate(addresses):
        Recipient.objects.create(
            email=email,
            address=addr.email,
            name=addr.name,
            kind=kind,
            order=i,
        )
