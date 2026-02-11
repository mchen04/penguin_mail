from django.db.models import Q
from ninja import Router

from penguin_mail.models import Contact, ContactGroup
from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.pagination import paginate_queryset
from penguin_mail.api.schemas.contact import ContactOut, ContactCreateIn, ContactUpdateIn
from penguin_mail.api.schemas.auth import SuccessOut

router = Router(auth=JWTAuth())


@router.get("/", response=dict)
def list_contacts(request, page: int = 1, pageSize: int = 50):
    qs = Contact.objects.filter(user=request.auth).prefetch_related("groups").order_by("name")
    result = paginate_queryset(qs, page, pageSize)
    return {
        "data": [ContactOut.from_model(c) for c in result["items"]],
        **result["pagination"],
    }


@router.get("/search", response=dict)
def search_contacts(request, q: str = "", page: int = 1, pageSize: int = 50):
    qs = Contact.objects.filter(user=request.auth).prefetch_related("groups")
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(email__icontains=q) | Q(company__icontains=q))
    qs = qs.order_by("name")
    result = paginate_queryset(qs, page, pageSize)
    return {
        "data": [ContactOut.from_model(c) for c in result["items"]],
        **result["pagination"],
    }


@router.get("/favorites", response=list[ContactOut])
def get_favorites(request):
    contacts = Contact.objects.filter(user=request.auth, is_favorite=True).prefetch_related("groups").order_by("name")
    return [ContactOut.from_model(c) for c in contacts]


@router.get("/by-group/{group_id}", response=list[ContactOut])
def get_by_group(request, group_id: str):
    try:
        group = ContactGroup.objects.get(uuid=group_id, user=request.auth)
    except ContactGroup.DoesNotExist:
        return router.create_response(request, {"detail": "Group not found"}, status=404)
    contacts = group.contacts.prefetch_related("groups").order_by("name")
    return [ContactOut.from_model(c) for c in contacts]


@router.get("/{contact_id}", response=ContactOut)
def get_contact(request, contact_id: str):
    try:
        contact = Contact.objects.prefetch_related("groups").get(uuid=contact_id, user=request.auth)
    except Contact.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    return ContactOut.from_model(contact)


@router.get("/by-email/{email}", response=ContactOut)
def get_by_email(request, email: str):
    try:
        contact = Contact.objects.prefetch_related("groups").get(email=email, user=request.auth)
    except Contact.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    return ContactOut.from_model(contact)


@router.post("/", response={201: ContactOut})
def create_contact(request, payload: ContactCreateIn):
    user = request.auth
    contact = Contact.objects.create(
        user=user,
        email=payload.email,
        name=payload.name,
        avatar=payload.avatar,
        phone=payload.phone,
        company=payload.company,
        notes=payload.notes,
    )
    if payload.groups:
        groups = ContactGroup.objects.filter(uuid__in=payload.groups, user=user)
        for g in groups:
            g.contacts.add(contact)
    contact = Contact.objects.prefetch_related("groups").get(pk=contact.pk)
    return 201, ContactOut.from_model(contact)


@router.patch("/{contact_id}", response=ContactOut)
def update_contact(request, contact_id: str, payload: ContactUpdateIn):
    user = request.auth
    try:
        contact = Contact.objects.get(uuid=contact_id, user=user)
    except Contact.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    if payload.email is not None:
        contact.email = payload.email
    if payload.name is not None:
        contact.name = payload.name
    if payload.avatar is not None:
        contact.avatar = payload.avatar
    if payload.phone is not None:
        contact.phone = payload.phone
    if payload.company is not None:
        contact.company = payload.company
    if payload.notes is not None:
        contact.notes = payload.notes
    if payload.isFavorite is not None:
        contact.is_favorite = payload.isFavorite
    contact.save()

    if payload.groups is not None:
        # Remove from all current groups
        for g in contact.groups.all():
            g.contacts.remove(contact)
        # Add to specified groups
        groups = ContactGroup.objects.filter(uuid__in=payload.groups, user=user)
        for g in groups:
            g.contacts.add(contact)

    contact = Contact.objects.prefetch_related("groups").get(pk=contact.pk)
    return ContactOut.from_model(contact)


@router.delete("/{contact_id}", response=SuccessOut)
def delete_contact(request, contact_id: str):
    try:
        contact = Contact.objects.get(uuid=contact_id, user=request.auth)
    except Contact.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    contact.delete()
    return SuccessOut()


@router.post("/{contact_id}/toggle-favorite", response=ContactOut)
def toggle_favorite(request, contact_id: str):
    try:
        contact = Contact.objects.get(uuid=contact_id, user=request.auth)
    except Contact.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    contact.is_favorite = not contact.is_favorite
    contact.save(update_fields=["is_favorite"])
    contact = Contact.objects.prefetch_related("groups").get(pk=contact.pk)
    return ContactOut.from_model(contact)


@router.post("/{contact_id}/add-to-group/{group_id}", response=SuccessOut)
def add_to_group(request, contact_id: str, group_id: str):
    user = request.auth
    try:
        contact = Contact.objects.get(uuid=contact_id, user=user)
        group = ContactGroup.objects.get(uuid=group_id, user=user)
    except (Contact.DoesNotExist, ContactGroup.DoesNotExist):
        return router.create_response(request, {"detail": "Not found"}, status=404)
    group.contacts.add(contact)
    return SuccessOut()


@router.post("/{contact_id}/remove-from-group/{group_id}", response=SuccessOut)
def remove_from_group(request, contact_id: str, group_id: str):
    user = request.auth
    try:
        contact = Contact.objects.get(uuid=contact_id, user=user)
        group = ContactGroup.objects.get(uuid=group_id, user=user)
    except (Contact.DoesNotExist, ContactGroup.DoesNotExist):
        return router.create_response(request, {"detail": "Not found"}, status=404)
    group.contacts.remove(contact)
    return SuccessOut()
