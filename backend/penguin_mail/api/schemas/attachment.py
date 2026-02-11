from ninja import Schema


class AttachmentOut(Schema):
    id: str
    name: str
    size: int
    mimeType: str
    url: str | None = None

    @staticmethod
    def from_model(attachment) -> "AttachmentOut":
        return AttachmentOut(
            id=str(attachment.uuid),
            name=attachment.name,
            size=attachment.size,
            mimeType=attachment.mime_type,
            url=attachment.file.url if attachment.file else None,
        )
