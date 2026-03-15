from django.db.models import Q
from ninja import Router
from ninja.errors import HttpError

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.pagination import paginate_queryset
from penguin_mail.api.schemas.auth import SuccessOut
from penguin_mail.api.schemas.contact import ContactCreateIn, ContactOut, ContactUpdateIn
from penguin_mail.api.shortcuts import get_object_or_404
from penguin_mail.models import Contact, ContactGroup

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
    group = get_object_or_404(ContactGroup, user=request.auth, uuid=group_id)
    contacts = group.contacts.prefetch_related("groups").order_by("name")
    return [ContactOut.from_model(c) for c in contacts]


@router.get("/{contact_id}", response=ContactOut)
def get_contact(request, contact_id: str):
    contact = Contact.objects.prefetch_related("groups").filter(uuid=contact_id, user=request.auth).first()
    if not contact:
        raise HttpError(404, "Not found")
    return ContactOut.from_model(contact)


@router.get("/by-email/{email}", response=ContactOut)
def get_by_email(request, email: str):
    contact = Contact.objects.prefetch_related("groups").filter(email=email, user=request.auth).first()
    if not contact:
        raise HttpError(404, "Not found")
    return ContactOut.from_model(contact)


@router.post("/", response={201: ContactOut})
def create_contact(request, payload: ContactCreateIn):
    user = request.auth
    if Contact.objects.filter(user=user, email=payload.email).exists():
        raise HttpError(409, "A contact with this email address already exists.")
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
    contact = get_object_or_404(Contact, user=user, uuid=contact_id)

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
    contact = get_object_or_404(Contact, user=request.auth, uuid=contact_id)
    contact.delete()
    return SuccessOut()


@router.post("/{contact_id}/toggle-favorite", response=ContactOut)
def toggle_favorite(request, contact_id: str):
    contact = get_object_or_404(Contact, user=request.auth, uuid=contact_id)
    contact.is_favorite = not contact.is_favorite
    contact.save(update_fields=["is_favorite"])
    contact = Contact.objects.prefetch_related("groups").get(pk=contact.pk)
    return ContactOut.from_model(contact)


@router.post("/{contact_id}/add-to-group/{group_id}", response=SuccessOut)
def add_to_group(request, contact_id: str, group_id: str):
    user = request.auth
    contact = get_object_or_404(Contact, user=user, uuid=contact_id)
    group = get_object_or_404(ContactGroup, user=user, uuid=group_id)
    group.contacts.add(contact)
    return SuccessOut()


@router.post("/{contact_id}/remove-from-group/{group_id}", response=SuccessOut)
def remove_from_group(request, contact_id: str, group_id: str):
    user = request.auth
    contact = get_object_or_404(Contact, user=user, uuid=contact_id)
    group = get_object_or_404(ContactGroup, user=user, uuid=group_id)
    group.contacts.remove(contact)
    return SuccessOut()
