from datetime import datetime
from typing import Literal

from ninja import Field, Schema
from pydantic import model_serializer

# Valid folder names — mirrors FolderType model choices.
ValidFolder = Literal[
    "inbox",
    "drafts",
    "sent",
    "spam",
    "trash",
    "archive",
    "starred",
    "snoozed",
    "scheduled",
]


class EmailAddressOut(Schema):
    name: str
    email: str


class AttachmentBrief(Schema):
    id: str
    name: str
    size: int
    mimeType: str
    url: str | None = None


class EmailOut(Schema):
    id: str
    accountId: str
    accountColor: str
    from_: EmailAddressOut = Field(serialization_alias="from")
    to: list[EmailAddressOut]
    cc: list[EmailAddressOut] = []
    bcc: list[EmailAddressOut] = []
    subject: str
    preview: str
    body: str
    date: datetime
    isRead: bool
    isStarred: bool
    hasAttachment: bool
    attachments: list[AttachmentBrief] = []
    folder: str
    labels: list[str] = []
    threadId: str | None = None
    replyToId: str | None = None
    forwardedFromId: str | None = None
    isDraft: bool
    scheduledSendAt: datetime | None = None
    snoozeUntil: datetime | None = None
    snoozedFromFolder: str | None = None

    class Config:
        json_schema_extra = {"properties": {"from": {"$ref": "#/$defs/EmailAddressOut"}}}

    @model_serializer(mode="wrap")
    def _serialize(self, handler):
        d = handler(self)
        if "from_" in d:
            d["from"] = d.pop("from_")
        return d

    @staticmethod
    def from_model(email) -> "EmailOut":
        recipients = email.recipients.all()
        to_list = [EmailAddressOut(name=r.name, email=r.address) for r in recipients if r.kind == "TO"]
        cc_list = [EmailAddressOut(name=r.name, email=r.address) for r in recipients if r.kind == "CC"]
        bcc_list = [EmailAddressOut(name=r.name, email=r.address) for r in recipients if r.kind == "BCC"]

        attachments = [
            AttachmentBrief(
                id=str(a.uuid),
                name=a.name,
                size=a.size,
                mimeType=a.mime_type,
                url=a.file.url if a.file else None,
            )
            for a in email.attachments.all()
        ]

        label_ids = [str(l.uuid) for l in email.labels.all()]

        return EmailOut(
            id=str(email.uuid),
            accountId=str(email.account.uuid),
            accountColor=email.account.color,
            from_=EmailAddressOut(name=email.sender_name, email=email.sender_email),
            to=to_list,
            cc=cc_list,
            bcc=bcc_list,
            subject=email.subject,
            preview=email.preview,
            body=email.body,
            date=email.created_at,
            isRead=email.is_read,
            isStarred=email.is_starred,
            hasAttachment=email.has_attachment,
            attachments=attachments,
            folder=email.folder,
            labels=label_ids,
            threadId=str(email.thread_id) if email.thread_id else None,
            replyToId=str(email.reply_to.uuid) if email.reply_to else None,
            forwardedFromId=str(email.forwarded_from.uuid) if email.forwarded_from else None,
            isDraft=email.is_draft,
            scheduledSendAt=email.scheduled_send_at,
            snoozeUntil=email.snooze_until,
            snoozedFromFolder=email.snoozed_from_folder,
        )


class EmailAddressIn(Schema):
    name: str = ""
    email: str


class EmailCreateIn(Schema):
    accountId: str
    to: list[EmailAddressIn]
    cc: list[EmailAddressIn] = []
    bcc: list[EmailAddressIn] = []
    subject: str = ""
    body: str = ""
    replyToId: str | None = None
    forwardedFromId: str | None = None
    scheduledSendAt: datetime | None = None


class EmailUpdateIn(Schema):
    isRead: bool | None = None
    isStarred: bool | None = None
    folder: ValidFolder | None = None
    labels: list[str] | None = None


BulkOperation = Literal[
    "markRead",
    "markUnread",
    "star",
    "unstar",
    "archive",
    "delete",
    "deletePermanent",
    "move",
    "addLabel",
    "removeLabel",
]


class BulkOpIn(Schema):
    ids: list[str]
    operation: BulkOperation
    folder: ValidFolder | None = None
    labelIds: list[str] | None = None


class LabelOpIn(Schema):
    labelIds: list[str]
