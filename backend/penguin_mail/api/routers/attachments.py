from django.http import FileResponse
from ninja import File, Router, UploadedFile
from ninja.errors import HttpError

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.attachment import AttachmentOut
from penguin_mail.models import Attachment

router = Router(auth=JWTAuth())


@router.post("/upload", response={201: AttachmentOut})
def upload_attachment(request, file: UploadedFile = File(...)):
    attachment = Attachment.objects.create(
        email=None,  # Staged — not yet linked to an email
        uploaded_by=request.auth,
        name=file.name,
        size=file.size,
        mime_type=file.content_type or "application/octet-stream",
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
