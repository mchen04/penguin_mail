from ninja import Router

from penguin_mail.models import Label
from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.label import LabelOut, LabelCreateIn, LabelUpdateIn
from penguin_mail.api.schemas.auth import SuccessOut

router = Router(auth=JWTAuth())


@router.get("/", response=list[LabelOut])
def list_labels(request):
    labels = Label.objects.filter(user=request.auth).order_by("name")
    return [LabelOut.from_model(l) for l in labels]


@router.get("/{label_id}", response=LabelOut)
def get_label(request, label_id: str):
    try:
        label = Label.objects.get(uuid=label_id, user=request.auth)
    except Label.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    return LabelOut.from_model(label)


@router.post("/", response={201: LabelOut})
def create_label(request, payload: LabelCreateIn):
    label = Label.objects.create(
        user=request.auth,
        name=payload.name,
        color=payload.color,
    )
    return 201, LabelOut.from_model(label)


@router.patch("/{label_id}", response=LabelOut)
def update_label(request, label_id: str, payload: LabelUpdateIn):
    try:
        label = Label.objects.get(uuid=label_id, user=request.auth)
    except Label.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    if payload.name is not None:
        label.name = payload.name
    if payload.color is not None:
        label.color = payload.color
    label.save()
    return LabelOut.from_model(label)


@router.delete("/{label_id}", response=SuccessOut)
def delete_label(request, label_id: str):
    try:
        label = Label.objects.get(uuid=label_id, user=request.auth)
    except Label.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    label.delete()
    return SuccessOut()
