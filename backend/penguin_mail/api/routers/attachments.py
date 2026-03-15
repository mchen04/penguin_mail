from django.http import FileResponse
from ninja import File, Router, UploadedFile
from ninja.errors import HttpError

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.attachment import AttachmentOut
from penguin_mail.models import Attachment

router = Router(auth=JWTAuth())

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "text/plain",
    "text/csv",
    "text/html",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "video/mp4",
    "video/mpeg",
    "video/webm",
}


@router.post("/upload", response={201: AttachmentOut})
def upload_attachment(request, file: UploadedFile = File(...)):
    mime_type = file.content_type or "application/octet-stream"

    if mime_type not in ALLOWED_MIME_TYPES:
        raise HttpError(415, f"Unsupported file type: {mime_type}")

    if file.size > MAX_UPLOAD_BYTES:
        raise HttpError(400, f"File too large. Maximum allowed size is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.")

    attachment = Attachment.objects.create(
        email=None,  # Staged — not yet linked to an email
        uploaded_by=request.auth,
        name=file.name,
        size=file.size,
        mime_type=mime_type,
        file=file,
    )
    return 201, AttachmentOut.from_model(attachment)


def _check_attachment_ownership(attachment, user):
    """Raise 404 if ``user`` does not own ``attachment``."""
    if attachment.email:
        if attachment.email.account.user != user:
            raise HttpError(404, "Not found")
    else:
        # Orphan (staged) attachment: only the uploader may access it.
        if attachment.uploaded_by is None or attachment.uploaded_by != user:
            raise HttpError(404, "Not found")


@router.get("/{attachment_id}", response=AttachmentOut)
def get_attachment(request, attachment_id: str):
    try:
        attachment = Attachment.objects.get(uuid=attachment_id)
    except Attachment.DoesNotExist:
        raise HttpError(404, "Not found")

    _check_attachment_ownership(attachment, request.auth)
    return AttachmentOut.from_model(attachment)


@router.get("/{attachment_id}/download")
def download_attachment(request, attachment_id: str):
    try:
        attachment = Attachment.objects.get(uuid=attachment_id)
    except Attachment.DoesNotExist:
        raise HttpError(404, "Not found")

    _check_attachment_ownership(attachment, request.auth)
    return FileResponse(attachment.file.open(), as_attachment=True, filename=attachment.name)
