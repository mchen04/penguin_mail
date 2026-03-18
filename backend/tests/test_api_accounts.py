"""Tests for account API endpoints."""

import json
import uuid
from unittest.mock import patch

from penguin_mail.models import Account


class TestListAccounts:
    def test_list_accounts_query_count(self, authed_client, user, django_assert_num_queries):
        from factories import AccountFactory

        for i in range(5):
            AccountFactory(user=user, email=f"acct{i}@example.com")
        # list_accounts: 1 auth SELECT + 1 SELECT accounts
        with django_assert_num_queries(2):
            resp = authed_client.get("/api/v1/accounts/")
        assert resp.status_code == 200
        assert len(resp.json()) == 5

    def test_empty(self, authed_client, user):
        resp = authed_client.get("/api/v1/accounts/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_with_data(self, authed_client, account):
        resp = authed_client.get("/api/v1/accounts/")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["email"] == "test@mail.example.com"

    def test_user_isolation(self, authed_client, account, second_account):
        resp = authed_client.get("/api/v1/accounts/")
        data = resp.json()
        assert len(data) == 1
        assert data[0]["email"] == account.email


class TestGetAccount:
    def test_success(self, authed_client, account):
        resp = authed_client.get(f"/api/v1/accounts/{account.uuid}")
        assert resp.status_code == 200
        assert resp.json()["email"] == account.email

    def test_not_found(self, authed_client):
        resp = authed_client.get(f"/api/v1/accounts/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestCreateAccount:
    def test_first_account_is_default(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps({"email": "new@example.com", "name": "New", "provider": "gmail", "password": "tok"}),
        )
        assert resp.status_code == 201
        assert resp.json()["isDefault"] is True

    def test_second_account_not_default(self, authed_client, account):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps({"email": "second@example.com", "name": "Second", "provider": "gmail", "password": "tok"}),
        )
        assert resp.status_code == 201
        assert resp.json()["isDefault"] is False

    def test_custom_color(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps(
                {"email": "a@b.com", "name": "A", "color": "green", "provider": "gmail", "password": "tok"}
            ),
        )
        assert resp.json()["color"] == "green"


class TestUpdateAccount:
    def test_update_name(self, authed_client, account):
        resp = authed_client.patch(
            f"/api/v1/accounts/{account.uuid}",
            data=json.dumps({"name": "Updated"}),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated"

    def test_update_all_fields(self, authed_client, account):
        resp = authed_client.patch(
            f"/api/v1/accounts/{account.uuid}",
            data=json.dumps(
                {
                    "color": "green",
                    "displayName": "Display",
                    "signature": "Regards",
                    "defaultSignatureId": "sig-1",
                    "avatar": "https://example.com/avatar.png",
                }
            ),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["color"] == "green"
        assert data["displayName"] == "Display"
        assert data["signature"] == "Regards"
        assert data["avatar"] == "https://example.com/avatar.png"

    def test_set_default_clears_others(self, authed_client, account, user):
        second = Account.objects.create(user=user, email="b@b.com", name="B")
        authed_client.patch(
            f"/api/v1/accounts/{second.uuid}",
            data=json.dumps({"isDefault": True}),
        )
        account.refresh_from_db()
        second.refresh_from_db()
        assert second.is_default is True
        assert account.is_default is False


class TestDeleteAccount:
    def test_success(self, authed_client, account):
        resp = authed_client.delete(f"/api/v1/accounts/{account.uuid}")
        assert resp.status_code == 200
        assert not Account.objects.filter(pk=account.pk).exists()


class TestSetDefault:
    def test_success(self, authed_client, account, user):
        second = Account.objects.create(user=user, email="b@b.com", name="B")
        resp = authed_client.post(f"/api/v1/accounts/{second.uuid}/set-default")
        assert resp.status_code == 200
        account.refresh_from_db()
        second.refresh_from_db()
        assert second.is_default is True
        assert account.is_default is False


class TestResolveServerSettings:
    """Cover _resolve_server_settings for custom provider and unknown provider paths."""

    def test_custom_provider(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps(
                {
                    "email": "custom@myserver.com",
                    "name": "Custom",
                    "provider": "custom",
                    "password": "tok",
                    "smtp_host": "smtp.myserver.com",
                    "imap_host": "imap.myserver.com",
                }
            ),
        )
        assert resp.status_code == 201
        acct = Account.objects.get(email="custom@myserver.com")
        assert acct.smtp_host == "smtp.myserver.com"
        assert acct.imap_host == "imap.myserver.com"
        assert acct.smtp_port == 587  # default
        assert acct.imap_port == 993  # default

    def test_custom_provider_with_all_fields(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps(
                {
                    "email": "full@myserver.com",
                    "name": "Full Custom",
                    "provider": "custom",
                    "password": "tok",
                    "smtp_host": "smtp.myserver.com",
                    "smtp_port": 465,
                    "smtp_security": "ssl",
                    "imap_host": "imap.myserver.com",
                    "imap_port": 143,
                    "imap_security": "starttls",
                }
            ),
        )
        assert resp.status_code == 201
        acct = Account.objects.get(email="full@myserver.com")
        assert acct.smtp_port == 465
        assert acct.smtp_security == "ssl"
        assert acct.imap_port == 143
        assert acct.imap_security == "starttls"

    def test_custom_provider_missing_hosts(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps(
                {
                    "email": "bad@custom.com",
                    "name": "Bad",
                    "provider": "custom",
                    "password": "tok",
                }
            ),
        )
        assert resp.status_code == 422

    def test_unknown_provider(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps(
                {
                    "email": "a@b.com",
                    "name": "Unknown",
                    "provider": "nonexistent_provider",
                    "password": "tok",
                }
            ),
        )
        assert resp.status_code == 422


class TestCreateAccountSyncFailure:
    """Cover lines 98-99: initial sync failure logging."""

    def test_initial_sync_failure_still_creates_account(self, authed_client, user):
        with patch(
            "penguin_mail.services.sync.sync_account_inbox",
            side_effect=Exception("IMAP down"),
        ):
            resp = authed_client.post(
                "/api/v1/accounts/",
                data=json.dumps(
                    {
                        "email": "sync-fail@example.com",
                        "name": "SyncFail",
                        "provider": "gmail",
                        "password": "tok",
                    }
                ),
            )
        assert resp.status_code == 201
        assert Account.objects.filter(email="sync-fail@example.com").exists()


class TestTestConnection:
    """Cover lines 150-183: test_connection endpoint."""

    def test_both_ok(self, authed_client, user):
        with (
            patch("penguin_mail.services.smtp.test_smtp_connection"),
            patch("penguin_mail.services.imap.test_imap_connection"),
        ):
            resp = authed_client.post(
                "/api/v1/accounts/test-connection",
                data=json.dumps(
                    {
                        "email": "test@gmail.com",
                        "provider": "gmail",
                        "password": "tok",
                    }
                ),
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["smtp"] is True
        assert data["imap"] is True
        assert data["smtp_error"] == ""
        assert data["imap_error"] == ""

    def test_smtp_failure(self, authed_client, user):
        with (
            patch(
                "penguin_mail.services.smtp.test_smtp_connection",
                side_effect=Exception("SMTP auth failed"),
            ),
            patch("penguin_mail.services.imap.test_imap_connection"),
        ):
            resp = authed_client.post(
                "/api/v1/accounts/test-connection",
                data=json.dumps(
                    {
                        "email": "test@gmail.com",
                        "provider": "gmail",
                        "password": "bad",
                    }
                ),
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["smtp"] is False
        assert "SMTP auth failed" in data["smtp_error"]
        assert data["imap"] is True

    def test_imap_failure(self, authed_client, user):
        with (
            patch("penguin_mail.services.smtp.test_smtp_connection"),
            patch(
                "penguin_mail.services.imap.test_imap_connection",
                side_effect=Exception("IMAP refused"),
            ),
        ):
            resp = authed_client.post(
                "/api/v1/accounts/test-connection",
                data=json.dumps(
                    {
                        "email": "test@gmail.com",
                        "provider": "gmail",
                        "password": "bad",
                    }
                ),
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["smtp"] is True
        assert data["imap"] is False
        assert "IMAP refused" in data["imap_error"]

    def test_both_fail(self, authed_client, user):
        with (
            patch(
                "penguin_mail.services.smtp.test_smtp_connection",
                side_effect=Exception("SMTP err"),
            ),
            patch(
                "penguin_mail.services.imap.test_imap_connection",
                side_effect=Exception("IMAP err"),
            ),
        ):
            resp = authed_client.post(
                "/api/v1/accounts/test-connection",
                data=json.dumps(
                    {
                        "email": "test@gmail.com",
                        "provider": "gmail",
                        "password": "bad",
                    }
                ),
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["smtp"] is False
        assert data["imap"] is False


class TestSyncAccount:
    """Cover lines 188-197: sync_account endpoint."""

    def test_sync_success(self, authed_client, account):
        resp = authed_client.post(f"/api/v1/accounts/{account.uuid}/sync")
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_sync_failure_returns_502(self, authed_client, account):
        with patch(
            "penguin_mail.services.sync.sync_account_inbox",
            side_effect=Exception("Connection refused"),
        ):
            resp = authed_client.post(f"/api/v1/accounts/{account.uuid}/sync")
        assert resp.status_code == 502

    def test_sync_not_found(self, authed_client):
        resp = authed_client.post(f"/api/v1/accounts/{uuid.uuid4()}/sync")
        assert resp.status_code == 404
