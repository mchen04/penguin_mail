from ninja import Router

from penguin_mail.api.auth import JWTAuth
from penguin_mail.api.schemas.account import AccountCreateIn, AccountOut, AccountUpdateIn
from penguin_mail.api.schemas.auth import SuccessOut
from penguin_mail.api.shortcuts import get_object_or_404
from penguin_mail.models import Account

router = Router(auth=JWTAuth())


@router.get("/", response=list[AccountOut])
def list_accounts(request):
    accounts = Account.objects.filter(user=request.auth).order_by("-is_default", "created_at")
    return [AccountOut.from_model(a) for a in accounts]


@router.get("/{account_id}", response=AccountOut)
def get_account(request, account_id: str):
    account = get_object_or_404(Account, user=request.auth, uuid=account_id)
    return AccountOut.from_model(account)


@router.post("/", response={201: AccountOut})
def create_account(request, payload: AccountCreateIn):
    user = request.auth
    # If this is the first account, make it default
    is_default = not Account.objects.filter(user=user).exists()

    account = Account.objects.create(
        user=user,
        email=payload.email,
        name=payload.name,
        color=payload.color,
        display_name=payload.displayName,
        signature=payload.signature,
        is_default=is_default,
    )
    return 201, AccountOut.from_model(account)


@router.patch("/{account_id}", response=AccountOut)
def update_account(request, account_id: str, payload: AccountUpdateIn):
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
def delete_account(request, account_id: str):
    account = get_object_or_404(Account, user=request.auth, uuid=account_id)

    account.delete()
    return SuccessOut()


@router.post("/{account_id}/set-default", response=SuccessOut)
def set_default(request, account_id: str):
    user = request.auth
    account = get_object_or_404(Account, user=user, uuid=account_id)

    Account.objects.filter(user=user).update(is_default=False)
    account.is_default = True
    account.save(update_fields=["is_default"])
    return SuccessOut()
