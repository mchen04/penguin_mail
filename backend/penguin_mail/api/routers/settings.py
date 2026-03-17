from ninja import Router
from ninja.errors import HttpError

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.auth import SuccessOut
from penguin_mail.api.schemas.settings import (
    BlockAddressIn,
    FilterCreateIn,
    FilterUpdateIn,
    SettingsOut,
    SettingsUpdateIn,
    SignatureCreateIn,
    SignatureUpdateIn,
)
from penguin_mail.api.types import AuthenticatedRequest
from penguin_mail.models import BlockedAddress, FilterRule, KeyboardShortcut, Signature, UserSettings

router = Router(auth=JWTAuth())


# ---------------------------------------------------------------------------
# Main settings
# ---------------------------------------------------------------------------


@router.get("/", response=SettingsOut)
def get_settings(request: AuthenticatedRequest) -> SettingsOut:
    return SettingsOut.from_user(request.auth)


@router.patch("/", response=SettingsOut)
def update_settings(request: AuthenticatedRequest, payload: SettingsUpdateIn) -> SettingsOut:
    user = request.auth
    us, _ = UserSettings.objects.get_or_create(user=user)

    if payload.appearance is not None:
        us.appearance = {**(us.appearance or {}), **payload.appearance}
    if payload.notifications is not None:
        us.notifications = {**(us.notifications or {}), **payload.notifications}
    if payload.inboxBehavior is not None:
        us.inbox_behavior = {**(us.inbox_behavior or {}), **payload.inboxBehavior}
    if payload.language is not None:
        us.language = {**(us.language or {}), **payload.language}
    if payload.vacationResponder is not None:
        us.vacation_responder = {**(us.vacation_responder or {}), **payload.vacationResponder}
    us.save()

    return SettingsOut.from_user(user)


@router.post("/reset", response=SettingsOut)
def reset_settings(request: AuthenticatedRequest) -> SettingsOut:
    user = request.auth
    us, _ = UserSettings.objects.get_or_create(user=user)
    us.appearance = {}
    us.notifications = {}
    us.inbox_behavior = {}
    us.language = {}
    us.vacation_responder = {}
    us.save()
    return SettingsOut.from_user(user)


# ---------------------------------------------------------------------------
# Signatures
# ---------------------------------------------------------------------------


@router.post("/signatures", response={201: SettingsOut})
def create_signature(request: AuthenticatedRequest, payload: SignatureCreateIn) -> tuple[int, SettingsOut]:
    user = request.auth
    if payload.isDefault:
        Signature.objects.filter(user=user).update(is_default=False)
    Signature.objects.create(
        user=user,
        name=payload.name,
        content=payload.content,
        is_default=payload.isDefault,
    )
    return 201, SettingsOut.from_user(user)


@router.patch("/signatures/{sig_id}", response=SettingsOut)
def update_signature(request: AuthenticatedRequest, sig_id: int, payload: SignatureUpdateIn) -> SettingsOut:
    user = request.auth
    try:
        sig = Signature.objects.get(pk=sig_id, user=user)
    except Signature.DoesNotExist:
        raise HttpError(404, "Not found")

    if payload.name is not None:
        sig.name = payload.name
    if payload.content is not None:
        sig.content = payload.content
    if payload.isDefault is True:
        Signature.objects.filter(user=user).update(is_default=False)
        sig.is_default = True
    elif payload.isDefault is False:
        sig.is_default = False
    sig.save()

    return SettingsOut.from_user(user)


@router.delete("/signatures/{sig_id}", response=SuccessOut)
def delete_signature(request: AuthenticatedRequest, sig_id: int) -> SuccessOut:
    try:
        sig = Signature.objects.get(pk=sig_id, user=request.auth)
    except Signature.DoesNotExist:
        raise HttpError(404, "Not found")
    sig.delete()
    return SuccessOut()


# ---------------------------------------------------------------------------
# Filters
# ---------------------------------------------------------------------------


@router.post("/filters", response={201: SettingsOut})
def create_filter(request: AuthenticatedRequest, payload: FilterCreateIn) -> tuple[int, SettingsOut]:
    user = request.auth
    FilterRule.objects.create(
        user=user,
        name=payload.name,
        enabled=payload.enabled,
        conditions=payload.conditions,
        match_all=payload.matchAll,
        actions=payload.actions,
    )
    return 201, SettingsOut.from_user(user)


@router.patch("/filters/{filter_id}", response=SettingsOut)
def update_filter(request: AuthenticatedRequest, filter_id: int, payload: FilterUpdateIn) -> SettingsOut:
    user = request.auth
    try:
        f = FilterRule.objects.get(pk=filter_id, user=user)
    except FilterRule.DoesNotExist:
        raise HttpError(404, "Not found")

    if payload.name is not None:
        f.name = payload.name
    if payload.enabled is not None:
        f.enabled = payload.enabled
    if payload.conditions is not None:
        f.conditions = payload.conditions
    if payload.matchAll is not None:
        f.match_all = payload.matchAll
    if payload.actions is not None:
        f.actions = payload.actions
    f.save()

    return SettingsOut.from_user(user)


@router.delete("/filters/{filter_id}", response=SuccessOut)
def delete_filter(request: AuthenticatedRequest, filter_id: int) -> SuccessOut:
    try:
        f = FilterRule.objects.get(pk=filter_id, user=request.auth)
    except FilterRule.DoesNotExist:
        raise HttpError(404, "Not found")
    f.delete()
    return SuccessOut()


# ---------------------------------------------------------------------------
# Blocked addresses
# ---------------------------------------------------------------------------


@router.post("/blocked-addresses", response={201: SettingsOut})
def block_address(request: AuthenticatedRequest, payload: BlockAddressIn) -> tuple[int, SettingsOut]:
    user = request.auth
    BlockedAddress.objects.get_or_create(user=user, email=payload.email.lower())
    return 201, SettingsOut.from_user(user)


@router.delete("/blocked-addresses/{email}", response=SuccessOut)
def unblock_address(request: AuthenticatedRequest, email: str) -> SuccessOut:
    try:
        ba = BlockedAddress.objects.get(email=email.lower(), user=request.auth)
    except BlockedAddress.DoesNotExist:
        raise HttpError(404, "Not found")
    ba.delete()
    return SuccessOut()


# ---------------------------------------------------------------------------
# Keyboard shortcuts
# ---------------------------------------------------------------------------


@router.patch("/keyboard-shortcuts/{shortcut_id}", response=SettingsOut)
def update_shortcut(
    request: AuthenticatedRequest,
    shortcut_id: int,
    enabled: bool | None = None,
    key: str | None = None,
    modifiers: list[str] | None = None,
) -> SettingsOut:
    user = request.auth
    try:
        ks = KeyboardShortcut.objects.get(pk=shortcut_id, user=user)
    except KeyboardShortcut.DoesNotExist:
        raise HttpError(404, "Not found")

    if enabled is not None:
        ks.enabled = enabled
    if key is not None:
        ks.key = key
    if modifiers is not None:
        ks.modifiers = modifiers
    ks.save()

    return SettingsOut.from_user(user)
