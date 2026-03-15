"""Tests for account API endpoints."""

import json
import uuid

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
            data=json.dumps({"email": "new@example.com", "name": "New"}),
        )
        assert resp.status_code == 201
        assert resp.json()["isDefault"] is True

    def test_second_account_not_default(self, authed_client, account):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps({"email": "second@example.com", "name": "Second"}),
        )
        assert resp.status_code == 201
        assert resp.json()["isDefault"] is False

    def test_custom_color(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/accounts/",
            data=json.dumps({"email": "a@b.com", "name": "A", "color": "green"}),
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
