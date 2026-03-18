import logging

from ninja import Router
from ninja.errors import HttpError

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.account import (
    AccountCreateIn,
    AccountOut,
    AccountUpdateIn,
    TestConnectionIn,
    TestConnectionOut,
)
from penguin_mail.api.schemas.auth import SuccessOut
from penguin_mail.api.shortcuts import get_object_or_404
from penguin_mail.api.types import AuthenticatedRequest
from penguin_mail.models import Account
from penguin_mail.providers import PROVIDER_PRESETS

logger = logging.getLogger(__name__)

router = Router(auth=JWTAuth())


def _resolve_server_settings(payload: AccountCreateIn | TestConnectionIn) -> dict:
    """Resolve SMTP/IMAP settings from provider preset or custom fields."""
    provider = payload.provider.lower()

    if provider != "custom" and provider in PROVIDER_PRESETS:
        preset = PROVIDER_PRESETS[provider]
        return {
            "smtp_host": preset["smtp_host"],
            "smtp_port": preset["smtp_port"],
            "smtp_security": preset["smtp_security"],
            "imap_host": preset["imap_host"],
            "imap_port": preset["imap_port"],
            "imap_security": preset["imap_security"],
        }

    if provider == "custom":
        if not payload.smtp_host or not payload.imap_host:
            raise HttpError(422, "Custom provider requires smtp_host and imap_host")
        return {
            "smtp_host": payload.smtp_host,
            "smtp_port": payload.smtp_port or 587,
            "smtp_security": payload.smtp_security or "starttls",
            "imap_host": payload.imap_host,
            "imap_port": payload.imap_port or 993,
            "imap_security": payload.imap_security or "ssl",
        }

    raise HttpError(422, f"Unknown provider: {provider}")


@router.get("/", response=list[AccountOut])
def list_accounts(request: AuthenticatedRequest) -> list[AccountOut]:
    accounts = Account.objects.filter(user=request.auth).order_by("-is_default", "created_at")
    return [AccountOut.from_model(a) for a in accounts]


@router.get("/{account_id}", response=AccountOut)
def get_account(request: AuthenticatedRequest, account_id: str) -> AccountOut:
    account = get_object_or_404(Account, user=request.auth, uuid=account_id)
    return AccountOut.from_model(account)


@router.post("/", response={201: AccountOut})
def create_account(request: AuthenticatedRequest, payload: AccountCreateIn) -> tuple[int, AccountOut]:
    user = request.auth
    is_default = not Account.objects.filter(user=user).exists()

    settings = _resolve_server_settings(payload)

    account = Account(
        user=user,
        email=payload.email,
        name=payload.name,
        color=payload.color,
        display_name=payload.displayName,
        signature=payload.signature,
        is_default=is_default,
        provider=payload.provider.lower(),
        smtp_host=settings["smtp_host"],
        smtp_port=settings["smtp_port"],
        smtp_security=settings["smtp_security"],
        imap_host=settings["imap_host"],
        imap_port=settings["imap_port"],
        imap_security=settings["imap_security"],
    )
    account.set_smtp_password(payload.password)
    account.set_imap_password(payload.password)
    account.save()

    try:
        from penguin_mail.services.sync import sync_account_inbox

        sync_account_inbox(account)
    except Exception:
        logger.exception("Initial sync failed for account %s", account.email)

    return 201, AccountOut.from_model(account)


@router.patch("/{account_id}", response=AccountOut)
def update_account(request: AuthenticatedRequest, account_id: str, payload: AccountUpdateIn) -> AccountOut:
    user = request.auth
    account = get_object_or_404(Account, user=user, uuid=account_id)

    if payload.name is not None:
        account.name = payload.name
    if payload.color is not None:
        account.color = payload.color
    if payload.displayName is not None:
        account.display_name = payload.displayName
    if payload.signature is not None:
        account.signature = payload.signature
    if payload.defaultSignatureId is not None:
        account.default_signature_id = payload.defaultSignatureId
    if payload.avatar is not None:
        account.avatar = payload.avatar
    if payload.isDefault is True:
        Account.objects.filter(user=user).update(is_default=False)
        account.is_default = True

    account.save()
    return AccountOut.from_model(account)


@router.delete("/{account_id}", response=SuccessOut)
def delete_account(request: AuthenticatedRequest, account_id: str) -> SuccessOut:
    account = get_object_or_404(Account, user=request.auth, uuid=account_id)

    account.delete()
    return SuccessOut()


@router.post("/{account_id}/set-default", response=SuccessOut)
def set_default(request: AuthenticatedRequest, account_id: str) -> SuccessOut:
    user = request.auth
    account = get_object_or_404(Account, user=user, uuid=account_id)

    Account.objects.filter(user=user).update(is_default=False)
    account.is_default = True
    account.save(update_fields=["is_default"])
    return SuccessOut()


@router.post("/test-connection", response=TestConnectionOut)
def test_connection(request: AuthenticatedRequest, payload: TestConnectionIn) -> TestConnectionOut:
    from penguin_mail.services.imap import test_imap_connection
    from penguin_mail.services.smtp import test_smtp_connection

    settings = _resolve_server_settings(payload)

    smtp_ok = True
    smtp_error = ""
    imap_ok = True
    imap_error = ""

    try:
        test_smtp_connection(
            host=settings["smtp_host"],
            port=settings["smtp_port"],
            security=settings["smtp_security"],
            email=payload.email,
            password=payload.password,
        )
    except Exception as e:
        smtp_ok = False
        smtp_error = str(e)

    try:
        test_imap_connection(
            host=settings["imap_host"],
            port=settings["imap_port"],
            email_addr=payload.email,
            password=payload.password,
        )
    except Exception as e:
        imap_ok = False
        imap_error = str(e)

    return TestConnectionOut(smtp=smtp_ok, imap=imap_ok, smtp_error=smtp_error, imap_error=imap_error)


@router.post("/{account_id}/sync", response=SuccessOut)
def sync_account(request: AuthenticatedRequest, account_id: str) -> SuccessOut:
    from penguin_mail.services.sync import sync_account_inbox

    account = get_object_or_404(Account, user=request.auth, uuid=account_id)

    try:
        sync_account_inbox(account)
    except Exception as e:
        raise HttpError(502, f"IMAP sync failed: {e}")

    return SuccessOut()
