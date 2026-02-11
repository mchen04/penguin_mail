from datetime import datetime
from typing import Optional

from ninja import Schema


class ContactOut(Schema):
    id: str
    email: str
    name: str
    avatar: str
    phone: str
    company: str
    notes: str
    isFavorite: bool
    groups: list[str]
    createdAt: datetime
    updatedAt: datetime

    @staticmethod
    def from_model(contact) -> "ContactOut":
        group_ids = [str(g.uuid) for g in contact.groups.all()]
        return ContactOut(
            id=str(contact.uuid),
            email=contact.email,
            name=contact.name,
            avatar=contact.avatar,
            phone=contact.phone,
            company=contact.company,
            notes=contact.notes,
            isFavorite=contact.is_favorite,
            groups=group_ids,
            createdAt=contact.created_at,
            updatedAt=contact.updated_at,
        )


class ContactCreateIn(Schema):
    email: str
    name: str
    avatar: str = ""
    phone: str = ""
    company: str = ""
    notes: str = ""
    groups: list[str] = []


class ContactUpdateIn(Schema):
    email: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None
    isFavorite: Optional[bool] = None
    groups: Optional[list[str]] = None


class ContactGroupOut(Schema):
    id: str
    name: str
    color: str
    contactIds: list[str]
    createdAt: datetime
    updatedAt: datetime

    @staticmethod
    def from_model(group) -> "ContactGroupOut":
        contact_ids = [str(c.uuid) for c in group.contacts.all()]
        return ContactGroupOut(
            id=str(group.uuid),
            name=group.name,
            color=group.color,
            contactIds=contact_ids,
            createdAt=group.created_at,
            updatedAt=group.updated_at,
        )


class ContactGroupCreateIn(Schema):
    name: str
    color: str = ""


class ContactGroupUpdateIn(Schema):
    name: Optional[str] = None
    color: Optional[str] = None
