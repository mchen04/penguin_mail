"""Tests for JWT authentication utilities."""

import datetime

import jwt
from django.conf import settings

from penguin_mail.api.auth import (
    ACCESS_TOKEN_LIFETIME,
    ALGORITHM,
    REFRESH_TOKEN_LIFETIME,
    JWTAuth,
    create_access_token,
    create_refresh_token,
    decode_token,
)


class TestCreateAccessToken:
    def test_returns_token_and_expiry(self, user):
        token, expires_in = create_access_token(user)
        assert isinstance(token, str)
        assert expires_in == int(ACCESS_TOKEN_LIFETIME.total_seconds())

    def test_token_has_correct_claims(self, user):
        token, _ = create_access_token(user)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == str(user.uuid)
        assert payload["type"] == "access"
        assert "iat" in payload
        assert "exp" in payload

    def test_token_expiry_is_15_minutes(self, user):
        token, _ = create_access_token(user)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        delta = payload["exp"] - payload["iat"]
        assert delta == int(ACCESS_TOKEN_LIFETIME.total_seconds())


class TestCreateRefreshToken:
    def test_returns_string(self, user):
        token = create_refresh_token(user)
        assert isinstance(token, str)

    def test_token_has_refresh_type(self, user):
        token = create_refresh_token(user)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["type"] == "refresh"

    def test_token_expiry_is_7_days(self, user):
        token = create_refresh_token(user)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        delta = payload["exp"] - payload["iat"]
        assert delta == int(REFRESH_TOKEN_LIFETIME.total_seconds())


class TestDecodeToken:
    def test_valid_token(self, user):
        token, _ = create_access_token(user)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == str(user.uuid)

    def test_expired_token(self, user):
        now = datetime.datetime.now(datetime.UTC)
        payload = {
            "sub": str(user.uuid),
            "type": "access",
            "iat": now - datetime.timedelta(hours=1),
            "exp": now - datetime.timedelta(minutes=1),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
        assert decode_token(token) is None

    def test_tampered_token(self, user):
        token, _ = create_access_token(user)
        # Tamper with the token
        tampered = token[:-5] + "XXXXX"
        assert decode_token(tampered) is None

    def test_garbage_input(self):
        assert decode_token("not-a-token") is None
        assert decode_token("") is None


class TestJWTAuth:
    def setup_method(self):
        self.auth = JWTAuth()

    def test_accepts_valid_access_token(self, user, rf):
        token, _ = create_access_token(user)
        request = rf.get("/")
        result = self.auth.authenticate(request, token)
        assert result == user

    def test_rejects_refresh_token(self, user, rf):
        token = create_refresh_token(user)
        request = rf.get("/")
        result = self.auth.authenticate(request, token)
        assert result is None

    def test_rejects_invalid_token(self, rf):
        request = rf.get("/")
        result = self.auth.authenticate(request, "garbage")
        assert result is None

    def test_handles_deleted_user(self, user, rf):
        token, _ = create_access_token(user)
        user.delete()
        request = rf.get("/")
        result = self.auth.authenticate(request, token)
        assert result is None
