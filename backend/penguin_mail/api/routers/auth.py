from django.contrib.auth import authenticate
from ninja import Router

from penguin_mail.models import User
from penguin_mail.api.auth import JWTAuth, create_access_token, create_refresh_token, decode_token
from penguin_mail.api.schemas.auth import LoginIn, TokenOut, RefreshIn, RefreshOut, SuccessOut

router = Router()


@router.post("/login", response=TokenOut)
def login(request, payload: LoginIn):
    # Look up user by email to get the username
    try:
        user_obj = User.objects.get(email=payload.email)
    except User.DoesNotExist:
        return router.create_response(request, {"detail": "Invalid credentials"}, status=401)

    user = authenticate(request, username=user_obj.username, password=payload.password)
    if user is None:
        return router.create_response(request, {"detail": "Invalid credentials"}, status=401)

    access_token, expires_in = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return TokenOut(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


@router.post("/refresh", response=RefreshOut)
def refresh(request, payload: RefreshIn):
    data = decode_token(payload.refresh_token)
    if data is None or data.get("type") != "refresh":
        return router.create_response(request, {"detail": "Invalid refresh token"}, status=401)

    try:
        user = User.objects.get(uuid=data["sub"])
    except User.DoesNotExist:
        return router.create_response(request, {"detail": "Invalid refresh token"}, status=401)

    access_token, expires_in = create_access_token(user)
    return RefreshOut(access_token=access_token, expires_in=expires_in)


@router.post("/logout", auth=JWTAuth(), response=SuccessOut)
def logout(request):
    return SuccessOut(success=True)
