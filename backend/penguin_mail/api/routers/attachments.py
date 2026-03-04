from django.http import FileResponse
from ninja import Router, File, UploadedFile
from ninja.errors import HttpError

from penguin_mail.models import Attachment, Email
from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.attachment import AttachmentOut

router = Router(auth=JWTAuth())


@router.post("/upload", response={201: AttachmentOut})
def upload_attachment(request, file: UploadedFile = File(...)):
    attachment = Attachment.objects.create(
        email=None,  # Staged — not yet linked to an email
        name=file.name,
        size=file.size,
        mime_type=file.content_type or "application/octet-stream",
        file=file,
    )
    return 201, AttachmentOut.from_model(attachment)


@router.get("/{attachment_id}", response=AttachmentOut)
def get_attachment(request, attachment_id: str):
    try:
        attachment = Attachment.objects.get(uuid=attachment_id)
    except Attachment.DoesNotExist:
        raise HttpError(404, "Not found")

    # Verify ownership
    if attachment.email and attachment.email.account.user != request.auth:
        raise HttpError(404, "Not found")

    return AttachmentOut.from_model(attachment)


@router.get("/{attachment_id}/download")
def download_attachment(request, attachment_id: str):
    try:
        attachment = Attachment.objects.get(uuid=attachment_id)
    except Attachment.DoesNotExist:
        raise HttpError(404, "Not found")

    # Verify ownership
    if attachment.email and attachment.email.account.user != request.auth:
        raise HttpError(404, "Not found")

    return FileResponse(attachment.file.open(), as_attachment=True, filename=attachment.name)
