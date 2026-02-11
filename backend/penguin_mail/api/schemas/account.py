from datetime import datetime
from typing import Optional

from ninja import Schema


class AccountOut(Schema):
    id: str
    email: str
    name: str
    color: str
    displayName: str
    signature: str
    defaultSignatureId: str
    avatar: str
    isDefault: bool
    createdAt: datetime
    updatedAt: datetime

    @staticmethod
    def from_model(account) -> "AccountOut":
        return AccountOut(
            id=str(account.uuid),
            email=account.email,
            name=account.name,
            color=account.color,
            displayName=account.display_name,
            signature=account.signature,
            defaultSignatureId=account.default_signature_id,
            avatar=account.avatar,
            isDefault=account.is_default,
            createdAt=account.created_at,
            updatedAt=account.updated_at,
        )


class AccountCreateIn(Schema):
    email: str
    name: str
    color: str = "blue"
    displayName: str = ""
    signature: str = ""


class AccountUpdateIn(Schema):
    name: Optional[str] = None
    color: Optional[str] = None
    displayName: Optional[str] = None
    signature: Optional[str] = None
    defaultSignatureId: Optional[str] = None
    avatar: Optional[str] = None
    isDefault: Optional[bool] = None
