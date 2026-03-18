from unittest.mock import patch

import pytest
from django.test import Client

from penguin_mail.api.auth import create_access_token
from penguin_mail.models import Account, User


@pytest.fixture(autouse=True)
def _mock_sync_services():
    """Prevent real IMAP sync and SMTP send from running during tests."""
    with (
        patch("penguin_mail.services.sync.sync_account_inbox"),
        patch("penguin_mail.services.sync.sync_all_folders"),
        patch("penguin_mail.services.smtp.send_email"),
    ):
        yield


@pytest.fixture(autouse=True)
def _use_tmp_media(settings, tmp_path):
    """Route all file uploads to a temp directory so tests don't pollute media/."""
    settings.MEDIA_ROOT = tmp_path / "media"


@pytest.fixture
def user(db):
    u = User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
        first_name="Test",
        last_name="User",
    )
    return u


@pytest.fixture
def second_user(db):
    u = User.objects.create_user(
        username="otheruser",
        email="other@example.com",
        password="testpass123",
        first_name="Other",
        last_name="User",
    )
    return u


@pytest.fixture
def account(user):
    return Account.objects.create(
        user=user,
        email="test@mail.example.com",
        name="Test Account",
        color="blue",
        is_default=True,
    )


@pytest.fixture
def second_account(second_user):
    return Account.objects.create(
        user=second_user,
        email="other@mail.example.com",
        name="Other Account",
        color="green",
        is_default=True,
    )


@pytest.fixture
def auth_headers(user):
    token, _ = create_access_token(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


@pytest.fixture
def second_auth_headers(second_user):
    token, _ = create_access_token(second_user)
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


@pytest.fixture
def api_client():
    return Client()


@pytest.fixture
def authed_client(api_client, auth_headers):
    """Client with auth headers pre-configured via a helper."""

    class AuthedClient:
        def __init__(self, client, headers):
            self._client = client
            self._headers = headers

        def get(self, path, data=None, **kwargs):
            return self._client.get(path, data=data, **{**self._headers, **kwargs})

        def post(self, path, data=None, content_type="application/json", **kwargs):
            return self._client.post(path, data=data, content_type=content_type, **{**self._headers, **kwargs})

        def patch(self, path, data=None, content_type="application/json", **kwargs):
            return self._client.patch(path, data=data, content_type=content_type, **{**self._headers, **kwargs})

        def delete(self, path, data=None, content_type="application/json", **kwargs):
            return self._client.delete(path, data=data, content_type=content_type, **{**self._headers, **kwargs})

    return AuthedClient(api_client, auth_headers)
