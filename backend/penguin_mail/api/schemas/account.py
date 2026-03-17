from datetime import datetime
from typing import Optional

from ninja import Schema


class AccountOut(Schema):
    id: str
    email: str
    name: str
    color: str
    provider: str
    displayName: str
    signature: str
    defaultSignatureId: str
    avatar: str
    isDefault: bool
    createdAt: datetime
    updatedAt: datetime
    lastSyncAt: Optional[datetime] = None

    @staticmethod
    def from_model(account) -> "AccountOut":
        return AccountOut(
            id=str(account.uuid),
            email=account.email,
            name=account.name,
            color=account.color,
            provider=account.provider,
            displayName=account.display_name,
            signature=account.signature,
            defaultSignatureId=account.default_signature_id,
            avatar=account.avatar,
            isDefault=account.is_default,
            createdAt=account.created_at,
            updatedAt=account.updated_at,
            lastSyncAt=account.last_sync_at,
        )


class AccountCreateIn(Schema):
    email: str
    name: str
    color: str = "blue"
    displayName: str = ""
    signature: str = ""

    # Provider-based setup
    provider: str = "custom"
    password: str = ""

    # Custom server fields (only required when provider is 'custom')
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_security: Optional[str] = None
    imap_host: Optional[str] = None
    imap_port: Optional[int] = None
    imap_security: Optional[str] = None


class AccountUpdateIn(Schema):
    name: Optional[str] = None
    color: Optional[str] = None
    displayName: Optional[str] = None
    signature: Optional[str] = None
    defaultSignatureId: Optional[str] = None
    avatar: Optional[str] = None
    isDefault: Optional[bool] = None


class TestConnectionIn(Schema):
    email: str
    provider: str = "custom"
    password: str = ""
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_security: Optional[str] = None
    imap_host: Optional[str] = None
    imap_port: Optional[int] = None
    imap_security: Optional[str] = None


class TestConnectionOut(Schema):
    smtp: bool
    imap: bool
    smtp_error: str = ""
    imap_error: str = ""
