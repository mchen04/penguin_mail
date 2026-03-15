"""Tests for authentication API endpoints."""

import json

import pytest
from django.test import Client

from penguin_mail.api.auth import create_refresh_token


@pytest.fixture
def client(db):
    return Client()


class TestLogin:
    def test_success(self, client, user):
        resp = client.post(
            "/api/v1/auth/login",
            data=json.dumps({"email": "test@example.com", "password": "testpass123"}),
            content_type="application/json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "expires_in" in data
        assert data["token_type"] == "Bearer"

    def test_wrong_password(self, client, user):
        resp = client.post(
            "/api/v1/auth/login",
            data=json.dumps({"email": "test@example.com", "password": "wrong"}),
            content_type="application/json",
        )
        assert resp.status_code == 401
        body = resp.json()
        assert "detail" in body
        assert body["detail"]  # non-empty error message

    def test_nonexistent_user(self, client):
        resp = client.post(
            "/api/v1/auth/login",
            data=json.dumps({"email": "nobody@example.com", "password": "testpass123"}),
            content_type="application/json",
        )
        assert resp.status_code == 401
        body = resp.json()
        assert "detail" in body
        assert body["detail"]

    def test_empty_body(self, client):
        resp = client.post(
            "/api/v1/auth/login",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert resp.status_code == 422


class TestRefresh:
    def test_valid_refresh(self, client, user):
        refresh = create_refresh_token(user)
        resp = client.post(
            "/api/v1/auth/refresh",
            data=json.dumps({"refresh_token": refresh}),
            content_type="application/json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "expires_in" in data

    def test_invalid_refresh_token(self, client):
        resp = client.post(
            "/api/v1/auth/refresh",
            data=json.dumps({"refresh_token": "invalid"}),
            content_type="application/json",
        )
        assert resp.status_code == 401

    def test_access_token_as_refresh(self, client, user):
        from penguin_mail.api.auth import create_access_token

        token, _ = create_access_token(user)
        resp = client.post(
            "/api/v1/auth/refresh",
            data=json.dumps({"refresh_token": token}),
            content_type="application/json",
        )
        assert resp.status_code == 401

    def test_refresh_with_deleted_user(self, client, user):
        refresh = create_refresh_token(user)
        user.delete()
        resp = client.post(
            "/api/v1/auth/refresh",
            data=json.dumps({"refresh_token": refresh}),
            content_type="application/json",
        )
        assert resp.status_code == 401


class TestLogout:
    def test_success(self, authed_client):
        resp = authed_client.post("/api/v1/auth/logout")
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_unauthenticated(self, client):
        resp = client.post("/api/v1/auth/logout")
        assert resp.status_code == 401
