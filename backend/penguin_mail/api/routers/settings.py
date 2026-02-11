from ninja import Router

from penguin_mail.models import UserSettings, Signature, FilterRule, BlockedAddress, KeyboardShortcut
from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.settings import (
    SettingsOut,
    SettingsUpdateIn,
    SignatureCreateIn,
    SignatureUpdateIn,
    FilterCreateIn,
    FilterUpdateIn,
    BlockAddressIn,
)
from penguin_mail.api.schemas.auth import SuccessOut

router = Router(auth=JWTAuth())


# ---------------------------------------------------------------------------
# Main settings
# ---------------------------------------------------------------------------

@router.get("/", response=SettingsOut)
def get_settings(request):
    return SettingsOut.from_user(request.auth)


@router.patch("/", response=SettingsOut)
def update_settings(request, payload: SettingsUpdateIn):
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
def reset_settings(request):
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
def create_signature(request, payload: SignatureCreateIn):
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
def update_signature(request, sig_id: int, payload: SignatureUpdateIn):
    user = request.auth
    try:
        sig = Signature.objects.get(pk=sig_id, user=user)
    except Signature.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

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
def delete_signature(request, sig_id: int):
    try:
        sig = Signature.objects.get(pk=sig_id, user=request.auth)
    except Signature.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    sig.delete()
    return SuccessOut()


# ---------------------------------------------------------------------------
# Filters
# ---------------------------------------------------------------------------

@router.post("/filters", response={201: SettingsOut})
def create_filter(request, payload: FilterCreateIn):
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
def update_filter(request, filter_id: int, payload: FilterUpdateIn):
    user = request.auth
    try:
        f = FilterRule.objects.get(pk=filter_id, user=user)
    except FilterRule.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

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
def delete_filter(request, filter_id: int):
    try:
        f = FilterRule.objects.get(pk=filter_id, user=request.auth)
    except FilterRule.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    f.delete()
    return SuccessOut()


# ---------------------------------------------------------------------------
# Blocked addresses
# ---------------------------------------------------------------------------

@router.post("/blocked-addresses", response={201: SettingsOut})
def block_address(request, payload: BlockAddressIn):
    user = request.auth
    BlockedAddress.objects.get_or_create(user=user, email=payload.email.lower())
    return 201, SettingsOut.from_user(user)


@router.delete("/blocked-addresses/{email}", response=SuccessOut)
def unblock_address(request, email: str):
    try:
        ba = BlockedAddress.objects.get(email=email.lower(), user=request.auth)
    except BlockedAddress.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)
    ba.delete()
    return SuccessOut()


# ---------------------------------------------------------------------------
# Keyboard shortcuts
# ---------------------------------------------------------------------------

@router.patch("/keyboard-shortcuts/{shortcut_id}", response=SettingsOut)
def update_shortcut(request, shortcut_id: int, enabled: bool = None, key: str = None, modifiers: list[str] = None):
    user = request.auth
    try:
        ks = KeyboardShortcut.objects.get(pk=shortcut_id, user=user)
    except KeyboardShortcut.DoesNotExist:
        return router.create_response(request, {"detail": "Not found"}, status=404)

    if enabled is not None:
        ks.enabled = enabled
    if key is not None:
        ks.key = key
    if modifiers is not None:
        ks.modifiers = modifiers
    ks.save()

    return SettingsOut.from_user(user)
