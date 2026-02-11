from ninja import Router

from penguin_mail.models import ContactGroup
from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.contact import ContactGroupOut, ContactGroupCreateIn, ContactGroupUpdateIn
from penguin_mail.api.schemas.auth import SuccessOut

router = Router(auth=JWTAuth())


@router.get("/", response=list[ContactGroupOut])
def list_groups(request):
    groups = ContactGroup.objects.filter(user=request.auth).prefetch_related("contacts").order_by("name")
    return [ContactGroupOut.from_model(g) for g in groups]


@router.get("/{group_id}", response=ContactGroupOut)
def get_group(request, group_id: str):
    try:
        group = ContactGroup.objects.prefetch_related("contacts").get(uuid=group_id, user=request.auth)
    except ContactGroup.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    return ContactGroupOut.from_model(group)


@router.post("/", response={201: ContactGroupOut})
def create_group(request, payload: ContactGroupCreateIn):
    group = ContactGroup.objects.create(
        user=request.auth,
        name=payload.name,
        color=payload.color,
    )
    group = ContactGroup.objects.prefetch_related("contacts").get(pk=group.pk)
    return 201, ContactGroupOut.from_model(group)


@router.patch("/{group_id}", response=ContactGroupOut)
def update_group(request, group_id: str, payload: ContactGroupUpdateIn):
    try:
        group = ContactGroup.objects.get(uuid=group_id, user=request.auth)
    except ContactGroup.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    if payload.name is not None:
        group.name = payload.name
    if payload.color is not None:
        group.color = payload.color
    group.save()

    group = ContactGroup.objects.prefetch_related("contacts").get(pk=group.pk)
    return ContactGroupOut.from_model(group)


@router.delete("/{group_id}", response=SuccessOut)
def delete_group(request, group_id: str):
    try:
        group = ContactGroup.objects.get(uuid=group_id, user=request.auth)
    except ContactGroup.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    group.delete()
    return SuccessOut()
