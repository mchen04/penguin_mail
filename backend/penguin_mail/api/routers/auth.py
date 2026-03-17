from django.contrib.auth import authenticate
from ninja import Router
from ninja.errors import HttpError

from penguin_mail.api.auth import JWTAuth, create_access_token, create_refresh_token, decode_token
from penguin_mail.api.schemas.auth import LoginIn, RefreshIn, RefreshOut, SuccessOut, TokenOut
from penguin_mail.api.types import AuthenticatedRequest
from penguin_mail.models import User

router = Router()


@router.post("/login", response=TokenOut)
def login(request: AuthenticatedRequest, payload: LoginIn) -> TokenOut:
    # Look up user by email to get the username
    try:
        user_obj = User.objects.get(email=payload.email)
    except User.DoesNotExist:
        raise HttpError(401, "Invalid credentials")

    user = authenticate(request, username=user_obj.username, password=payload.password)
    if user is None:
        raise HttpError(401, "Invalid credentials")

    access_token, expires_in = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return TokenOut(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


@router.post("/refresh", response=RefreshOut)
def refresh(request: AuthenticatedRequest, payload: RefreshIn) -> RefreshOut:
    data = decode_token(payload.refresh_token)
    if data is None or data.get("type") != "refresh":
        raise HttpError(401, "Invalid refresh token")

    try:
        user = User.objects.get(uuid=data["sub"])
    except User.DoesNotExist:
        raise HttpError(401, "Invalid refresh token")

    access_token, expires_in = create_access_token(user)
    return RefreshOut(access_token=access_token, expires_in=expires_in)


@router.post("/logout", auth=JWTAuth(), response=SuccessOut)
def logout(request: AuthenticatedRequest) -> SuccessOut:
    return SuccessOut(success=True)
