from ninja import Router

from penguin_mail.models import CustomFolder
from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.folder import FolderOut, FolderCreateIn, FolderUpdateIn
from penguin_mail.api.schemas.auth import SuccessOut

router = Router(auth=JWTAuth())


@router.get("/", response=list[FolderOut])
def list_folders(request):
    folders = CustomFolder.objects.filter(user=request.auth).select_related("parent").order_by("order", "name")
    return [FolderOut.from_model(f) for f in folders]


@router.get("/{folder_id}", response=FolderOut)
def get_folder(request, folder_id: str):
    try:
        folder = CustomFolder.objects.select_related("parent").get(uuid=folder_id, user=request.auth)
    except CustomFolder.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    return FolderOut.from_model(folder)


@router.post("/", response={201: FolderOut})
def create_folder(request, payload: FolderCreateIn):
    user = request.auth
    parent = None
    if payload.parentId:
        try:
            parent = CustomFolder.objects.get(uuid=payload.parentId, user=user)
        except CustomFolder.DoesNotExist:
            return router.create_response(request, {"detail": "Parent folder not found"}, status=404)

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
def update_folder(request, folder_id: str, payload: FolderUpdateIn):
    try:
        folder = CustomFolder.objects.get(uuid=folder_id, user=request.auth)
    except CustomFolder.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    if payload.name is not None:
        folder.name = payload.name
    if payload.color is not None:
        folder.color = payload.color
    folder.save()

    folder = CustomFolder.objects.select_related("parent").get(pk=folder.pk)
    return FolderOut.from_model(folder)


@router.delete("/{folder_id}", response=SuccessOut)
def delete_folder(request, folder_id: str):
    try:
        folder = CustomFolder.objects.get(uuid=folder_id, user=request.auth)
    except CustomFolder.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    folder.delete()
    return SuccessOut()


@router.post("/{folder_id}/reorder", response=SuccessOut)
def reorder_folder(request, folder_id: str, newOrder: int = 0):
    user = request.auth
    try:
        folder = CustomFolder.objects.get(uuid=folder_id, user=user)
    except CustomFolder.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    siblings = list(
        CustomFolder.objects.filter(user=user, parent=folder.parent)
        .exclude(pk=folder.pk)
        .order_by("order")
    )

    # Insert at new position
    siblings.insert(min(newOrder, len(siblings)), folder)
    for i, f in enumerate(siblings):
        if f.order != i:
            f.order = i
            f.save(update_fields=["order"])

    return SuccessOut()
