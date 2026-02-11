import datetime

import jwt
from django.conf import settings
from ninja.security import HttpBearer

from penguin_mail.models import User

ACCESS_TOKEN_LIFETIME = datetime.timedelta(minutes=15)
REFRESH_TOKEN_LIFETIME = datetime.timedelta(days=7)
ALGORITHM = "HS256"


def create_access_token(user: User) -> tuple[str, int]:
    now = datetime.datetime.now(datetime.timezone.utc)
    expires = now + ACCESS_TOKEN_LIFETIME
    payload = {
        "sub": str(user.uuid),
        "type": "access",
        "iat": now,
        "exp": expires,
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
    return token, int(ACCESS_TOKEN_LIFETIME.total_seconds())


def create_refresh_token(user: User) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": str(user.uuid),
        "type": "refresh",
        "iat": now,
        "exp": now + REFRESH_TOKEN_LIFETIME,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


class JWTAuth(HttpBearer):
    def authenticate(self, request, token: str):
        payload = decode_token(token)
        if payload is None or payload.get("type") != "access":
            return None
        try:
            return User.objects.get(uuid=payload["sub"])
        except User.DoesNotExist:
            return None
