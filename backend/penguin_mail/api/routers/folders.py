from ninja import Router
from ninja.errors import HttpError

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.auth import SuccessOut
from penguin_mail.api.schemas.folder import FolderCreateIn, FolderOut, FolderUpdateIn
from penguin_mail.api.shortcuts import get_object_or_404
from penguin_mail.api.types import AuthenticatedRequest
from penguin_mail.models import CustomFolder

router = Router(auth=JWTAuth())


@router.get("/", response=list[FolderOut])
def list_folders(request: AuthenticatedRequest) -> list[FolderOut]:
    folders = CustomFolder.objects.filter(user=request.auth).select_related("parent").order_by("order", "name")
    return [FolderOut.from_model(f) for f in folders]


@router.get("/{folder_id}", response=FolderOut)
def get_folder(request: AuthenticatedRequest, folder_id: str) -> FolderOut:
    folder = CustomFolder.objects.select_related("parent").filter(user=request.auth, uuid=folder_id).first()
    if not folder:
        raise HttpError(404, "Not found")
    return FolderOut.from_model(folder)


@router.post("/", response={201: FolderOut})
def create_folder(request: AuthenticatedRequest, payload: FolderCreateIn) -> tuple[int, FolderOut]:
    user = request.auth
    parent = None
    if payload.parentId:
        parent = get_object_or_404(CustomFolder, user=user, uuid=payload.parentId)

    # Set order to be at the end
    max_order = CustomFolder.objects.filter(user=user, parent=parent).count()

    folder = CustomFolder.objects.create(
        user=user,
        name=payload.name,
        color=payload.color,
        parent=parent,
        order=max_order,
    )
    folder = CustomFolder.objects.select_related("parent").get(pk=folder.pk)
    return 201, FolderOut.from_model(folder)


@router.patch("/{folder_id}", response=FolderOut)
def update_folder(request: AuthenticatedRequest, folder_id: str, payload: FolderUpdateIn) -> FolderOut:
    folder = get_object_or_404(CustomFolder, user=request.auth, uuid=folder_id)

    if payload.name is not None:
        folder.name = payload.name
    if payload.color is not None:
        folder.color = payload.color
    folder.save()

    folder = CustomFolder.objects.select_related("parent").get(pk=folder.pk)
    return FolderOut.from_model(folder)


@router.delete("/{folder_id}", response=SuccessOut)
def delete_folder(request: AuthenticatedRequest, folder_id: str) -> SuccessOut:
    folder = get_object_or_404(CustomFolder, user=request.auth, uuid=folder_id)
    folder.delete()
    return SuccessOut()


@router.post("/{folder_id}/reorder", response=SuccessOut)
def reorder_folder(request: AuthenticatedRequest, folder_id: str, newOrder: int = 0) -> SuccessOut:
    user = request.auth
    folder = get_object_or_404(CustomFolder, user=user, uuid=folder_id)

    siblings = list(
        CustomFolder.objects.filter(user=user, parent=folder.parent).exclude(pk=folder.pk).order_by("order")
    )

    # Insert at new position
    siblings.insert(min(newOrder, len(siblings)), folder)
    for i, f in enumerate(siblings):
        if f.order != i:
            f.order = i
            f.save(update_fields=["order"])

    return SuccessOut()
