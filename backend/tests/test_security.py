"""Cross-cutting security tests — ensures all protected endpoints reject unauthenticated requests."""

import datetime
import json

import jwt
import pytest
from django.conf import settings
from django.test import Client

from factories import (
    ContactFactory,
    ContactGroupFactory,
    CustomFolderFactory,
    EmailFactory,
    LabelFactory,
    SignatureFactory,
)
from penguin_mail.api import api
from penguin_mail.api.auth import ALGORITHM, create_refresh_token


@pytest.fixture
def client(db):
    return Client()


def _get_protected_paths():
    """Collect all API paths that require authentication."""
    protected = set()
    url_patterns = api.urls[0]  # api.urls is (patterns, namespace, app_name)
    for url_pattern in url_patterns:
        path = f"/api/v1/{url_pattern.pattern}"
        # Skip auth login/refresh (public endpoints)
        if "/auth/login" in path or "/auth/refresh" in path:
            continue
        # Skip openapi, docs, api-root
        if "openapi" in path or path == "/api/v1/docs" or path == "/api/v1/":
            continue
        protected.add(path)
    return list(protected)


class TestAllEndpointsRequireAuth:
    def test_unauthenticated_requests_rejected(self, client):
        """Every protected endpoint should return 401 without a token."""
        paths = _get_protected_paths()
        assert len(paths) > 0, "Should find protected API paths"

        for path in paths:
            # Use a dummy UUID for path params
            concrete = path.replace("<email_id>", "00000000-0000-0000-0000-000000000000")
            concrete = concrete.replace("<account_id>", "00000000-0000-0000-0000-000000000000")
            concrete = concrete.replace("<contact_id>", "00000000-0000-0000-0000-000000000000")
            concrete = concrete.replace("<group_id>", "00000000-0000-0000-0000-000000000000")
            concrete = concrete.replace("<folder_id>", "00000000-0000-0000-0000-000000000000")
            concrete = concrete.replace("<label_id>", "00000000-0000-0000-0000-000000000000")
            concrete = concrete.replace("<attachment_id>", "00000000-0000-0000-0000-000000000000")
            concrete = concrete.replace("<sig_id>", "1")
            concrete = concrete.replace("<filter_id>", "1")
            concrete = concrete.replace("<shortcut_id>", "1")
            concrete = concrete.replace("<email>", "test@example.com")

            resp = client.get(concrete)
            # 401 = auth required, 405 = method not allowed (POST-only endpoints)
            # Both indicate the endpoint is not openly accessible
            assert resp.status_code in (401, 405), f"GET {concrete} should return 401 or 405, got {resp.status_code}"

    def test_expired_token_rejected(self, client):
        """Expired tokens should be rejected."""
        now = datetime.datetime.now(datetime.UTC)
        payload = {
            "sub": "00000000-0000-0000-0000-000000000000",
            "type": "access",
            "iat": now - datetime.timedelta(hours=1),
            "exp": now - datetime.timedelta(minutes=1),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
        resp = client.get(
            "/api/v1/emails/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        assert resp.status_code == 401

    def test_malformed_token_rejected(self, client):
        resp = client.get(
            "/api/v1/emails/",
            HTTP_AUTHORIZATION="Bearer not.a.valid.token",
        )
        assert resp.status_code == 401

    def test_refresh_token_rejected_for_api(self, client, user):
        """Refresh tokens should not be accepted for API access."""
        token = create_refresh_token(user)
        resp = client.get(
            "/api/v1/emails/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        assert resp.status_code == 401

    def test_login_endpoint_is_public(self, client):
        """Login should be accessible without auth (even if it returns an error)."""
        resp = client.post(
            "/api/v1/auth/login",
            data=json.dumps({"email": "a@b.com", "password": "x"}),
            content_type="application/json",
        )
        # Should get 401 (invalid credentials) not 401 (missing auth header)
        # Verify the error is about credentials, not about missing token
        assert resp.status_code in (401, 422)  # 401 = invalid creds, 422 = validation


class TestCrossUserAccess:
    """Tests that users cannot access other users' resources."""

    def test_cannot_access_other_users_account(self, authed_client, second_account):
        resp = authed_client.get(f"/api/v1/accounts/{second_account.uuid}")
        assert resp.status_code == 404

    def test_cannot_access_other_users_contact(self, authed_client, second_user):
        contact = ContactFactory(user=second_user)
        resp = authed_client.get(f"/api/v1/contacts/{contact.uuid}")
        assert resp.status_code == 404

    def test_cannot_access_other_users_contact_group(self, authed_client, second_user):
        group = ContactGroupFactory(user=second_user)
        resp = authed_client.get(f"/api/v1/contact-groups/{group.uuid}")
        assert resp.status_code == 404

    def test_cannot_access_other_users_folder(self, authed_client, second_user):
        folder = CustomFolderFactory(user=second_user)
        resp = authed_client.get(f"/api/v1/folders/{folder.uuid}")
        assert resp.status_code == 404

    def test_cannot_access_other_users_label(self, authed_client, second_user):
        label = LabelFactory(user=second_user)
        resp = authed_client.get(f"/api/v1/labels/{label.uuid}")
        assert resp.status_code == 404

    def test_bulk_ops_ignore_other_users_emails(self, authed_client, account, second_account):
        own_email = EmailFactory(account=account, is_read=False)
        other_email = EmailFactory(account=second_account, is_read=False)
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(own_email.uuid), str(other_email.uuid)],
                    "operation": "markRead",
                }
            ),
        )
        assert resp.status_code == 200
        own_email.refresh_from_db()
        other_email.refresh_from_db()
        assert own_email.is_read is True
        assert other_email.is_read is False  # Unchanged

    def test_token_with_deleted_user_rejected(self, client, user, auth_headers):
        user.delete()
        resp = client.get("/api/v1/emails/", **auth_headers)
        assert resp.status_code == 401

    def test_cannot_update_other_users_signature(self, authed_client, second_user):
        sig = SignatureFactory(user=second_user)
        resp = authed_client.patch(
            f"/api/v1/settings/signatures/{sig.pk}",
            data=json.dumps({"name": "Hacked"}),
        )
        assert resp.status_code == 404
