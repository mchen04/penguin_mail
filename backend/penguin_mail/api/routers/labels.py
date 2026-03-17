from ninja import Router

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.auth import SuccessOut
from penguin_mail.api.schemas.label import LabelCreateIn, LabelOut, LabelUpdateIn
from penguin_mail.api.shortcuts import get_object_or_404
from penguin_mail.api.types import AuthenticatedRequest
from penguin_mail.models import Label

router = Router(auth=JWTAuth())


@router.get("/", response=list[LabelOut])
def list_labels(request: AuthenticatedRequest) -> list[LabelOut]:
    labels = Label.objects.filter(user=request.auth).order_by("name")
    return [LabelOut.from_model(l) for l in labels]


@router.get("/{label_id}", response=LabelOut)
def get_label(request: AuthenticatedRequest, label_id: str) -> LabelOut:
    label = get_object_or_404(Label, user=request.auth, uuid=label_id)
    return LabelOut.from_model(label)


@router.post("/", response={201: LabelOut})
def create_label(request: AuthenticatedRequest, payload: LabelCreateIn) -> tuple[int, LabelOut]:
    label = Label.objects.create(
        user=request.auth,
        name=payload.name,
        color=payload.color,
    )
    return 201, LabelOut.from_model(label)


@router.patch("/{label_id}", response=LabelOut)
def update_label(request: AuthenticatedRequest, label_id: str, payload: LabelUpdateIn) -> LabelOut:
    label = get_object_or_404(Label, user=request.auth, uuid=label_id)

    if payload.name is not None:
        label.name = payload.name
    if payload.color is not None:
        label.color = payload.color
    label.save()
    return LabelOut.from_model(label)


@router.delete("/{label_id}", response=SuccessOut)
def delete_label(request: AuthenticatedRequest, label_id: str) -> SuccessOut:
    label = get_object_or_404(Label, user=request.auth, uuid=label_id)
    label.delete()
    return SuccessOut()
