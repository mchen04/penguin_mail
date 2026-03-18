from datetime import datetime

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
    lastSyncAt: datetime | None = None

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
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_security: str | None = None
    imap_host: str | None = None
    imap_port: int | None = None
    imap_security: str | None = None


class AccountUpdateIn(Schema):
    name: str | None = None
    color: str | None = None
    displayName: str | None = None
    signature: str | None = None
    defaultSignatureId: str | None = None
    avatar: str | None = None
    isDefault: bool | None = None


class TestConnectionIn(Schema):
    email: str
    provider: str = "custom"
    password: str = ""
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_security: str | None = None
    imap_host: str | None = None
    imap_port: int | None = None
    imap_security: str | None = None


class TestConnectionOut(Schema):
    smtp: bool
    imap: bool
    smtp_error: str = ""
    imap_error: str = ""
