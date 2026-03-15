"""Tests for attachment API endpoints."""

import uuid

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from factories import AttachmentFactory, EmailFactory


@pytest.fixture
def attachment(account):
    email = EmailFactory(account=account)
    return AttachmentFactory(email=email)


class TestUploadAttachment:
    def test_empty_file(self, authed_client, api_client, auth_headers):
        resp = api_client.post(
            "/api/v1/attachments/upload",
            data={"file": SimpleUploadedFile("empty.txt", b"", content_type="text/plain")},
            **auth_headers,
        )
        # Empty file should either succeed (0 bytes) or return a validation error
        assert resp.status_code in (201, 400, 422)

    def test_success(self, authed_client, api_client, auth_headers):
        # Need to use raw client for multipart upload
        file_data = b"file content here"
        resp = api_client.post(
            "/api/v1/attachments/upload",
            data={"file": SimpleUploadedFile("test.txt", file_data, content_type="text/plain")},
            **auth_headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "test.txt"
        assert data["size"] == len(file_data)
        assert data["mimeType"] == "text/plain"


class TestGetAttachment:
    def test_success(self, authed_client, attachment):
        resp = authed_client.get(f"/api/v1/attachments/{attachment.uuid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == attachment.name

    def test_not_found(self, authed_client):
        resp = authed_client.get(f"/api/v1/attachments/{uuid.uuid4()}")
        assert resp.status_code == 404

    def test_other_users_attachment(self, authed_client, second_account):
        email = EmailFactory(account=second_account)
        att = AttachmentFactory(email=email)
        resp = authed_client.get(f"/api/v1/attachments/{att.uuid}")
        assert resp.status_code == 404


class TestDeleteAttachmentWithEmail:
    def test_attachment_record_deleted_with_email(self, authed_client, account):
        email = EmailFactory(account=account)
        att = AttachmentFactory(email=email)

        # Permanently delete the email
        resp = authed_client.delete(f"/api/v1/emails/{email.uuid}/permanent")
        assert resp.status_code == 200

        from penguin_mail.models import Attachment

        # The attachment DB record should be cascade-deleted with the email
        assert not Attachment.objects.filter(pk=att.pk).exists()


class TestOrphanAttachmentOwnership:
    """Tests ownership enforcement for staged (email=None) attachments."""

    def test_uploader_can_retrieve_own_orphan_attachment(self, api_client, auth_headers, user):
        """The user who uploaded a staged attachment can retrieve it."""
        orphan = AttachmentFactory(email=None, uploaded_by=user)
        resp = api_client.get(f"/api/v1/attachments/{orphan.uuid}", **auth_headers)
        assert resp.status_code == 200

    def test_other_user_cannot_retrieve_orphan_attachment(self, api_client, second_auth_headers, user):
        """A different authenticated user is denied access to another user's orphan attachment."""
        orphan = AttachmentFactory(email=None, uploaded_by=user)
        resp = api_client.get(f"/api/v1/attachments/{orphan.uuid}", **second_auth_headers)
        assert resp.status_code == 404

    def test_orphan_without_uploader_is_inaccessible(self, api_client, auth_headers):
        """An orphan attachment with no uploaded_by is inaccessible to any user."""
        orphan = AttachmentFactory(email=None, uploaded_by=None)
        resp = api_client.get(f"/api/v1/attachments/{orphan.uuid}", **auth_headers)
        assert resp.status_code == 404


class TestDownloadAttachment:
    def test_success(self, authed_client, attachment):
        resp = authed_client.get(f"/api/v1/attachments/{attachment.uuid}/download")
        assert resp.status_code == 200

    def test_other_users_download(self, authed_client, second_account):
        email = EmailFactory(account=second_account)
        att = AttachmentFactory(email=email)
        resp = authed_client.get(f"/api/v1/attachments/{att.uuid}/download")
        assert resp.status_code == 404

    def test_not_found(self, authed_client):
        resp = authed_client.get(f"/api/v1/attachments/{uuid.uuid4()}/download")
        assert resp.status_code == 404
