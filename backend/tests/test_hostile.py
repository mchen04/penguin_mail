"""Hostile input tests — probe known dangerous inputs and boundary conditions.

Each test is written to document a specific bug or security gap.  Tests that
are expected to FAIL today are annotated with ``xfail`` so the suite stays
green while the bugs are tracked; remove the marker once the bug is fixed.
"""

import io
import json

import jwt
import pytest
from django.conf import settings
from django.test import Client

from factories import EmailFactory
from penguin_mail.api.auth import ALGORITHM

# ---------------------------------------------------------------------------
# B1 — EmailUpdateIn.folder accepts arbitrary strings (no FolderType enum)
# ---------------------------------------------------------------------------


class TestFolderValidation:
    """Bug B1: folder field on PATCH /emails/{id} is str|None with no enum validation."""

    def test_patch_email_arbitrary_folder_rejected(self, authed_client, account):
        """Sending folder='hacked' should be rejected (400/422), not silently stored."""
        email = EmailFactory(account=account, folder="inbox")
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"folder": "hacked"}),
        )
        # Bug B1: currently returns 200 and stores the value. Should be 400/422.
        assert resp.status_code in (
            400,
            422,
        ), f"Expected validation error, got {resp.status_code}. Bug B1: folder field accepts arbitrary strings."

    def test_patch_email_oversized_folder_rejected(self, authed_client, account):
        """A 1 000-char folder string should not be accepted."""
        email = EmailFactory(account=account, folder="inbox")
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"folder": "x" * 1000}),
        )
        assert resp.status_code in (
            400,
            422,
        ), f"Expected validation error for oversized folder, got {resp.status_code}."

    def test_bulk_move_arbitrary_folder_rejected(self, authed_client, account):
        """bulk MOVE_TO_FOLDER with an invalid folder name should be rejected."""
        email = EmailFactory(account=account, folder="inbox")
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(email.uuid)],
                    "operation": "move",
                    "folder": "definitely_not_a_real_folder",
                }
            ),
        )
        # Bug B1 (bulk variant): currently returns 200. Should be 400/422.
        assert resp.status_code in (
            400,
            422,
        ), f"Expected validation error for bulk move to invalid folder, got {resp.status_code}."


# ---------------------------------------------------------------------------
# B3 — Attachment upload has no MIME-type whitelist and no size limit
# ---------------------------------------------------------------------------


class TestAttachmentHostile:
    """Bug B3: POST /attachments/upload accepts any file type and any size."""

    def test_upload_executable_mime_type_rejected(self, authed_client):
        """Uploading an .exe with application/x-msdownload should be rejected."""
        content = b"MZ\x90\x00" + b"\x00" * 60  # minimal PE header
        fake_file = io.BytesIO(content)
        fake_file.name = "evil.exe"
        resp = authed_client._client.post(
            "/api/v1/attachments/upload",
            data={"file": fake_file},
            **authed_client._headers,
        )
        # Bug B3: currently returns 201 and stores the file. Should be 400/415.
        assert resp.status_code in (
            400,
            415,
        ), f"Expected rejection of executable upload, got {resp.status_code}. Bug B3: no MIME-type whitelist."

    def test_upload_path_traversal_filename(self, authed_client):
        """Filename with path traversal should be sanitised or rejected."""
        content = b"harmless content"
        fake_file = io.BytesIO(content)
        fake_file.name = "../../etc/passwd"
        resp = authed_client._client.post(
            "/api/v1/attachments/upload",
            data={"file": fake_file},
            **authed_client._headers,
        )
        # Should succeed but the stored name must not contain traversal sequences.
        if resp.status_code == 201:
            data = resp.json()
            name = data.get("name", "")
            assert ".." not in name, f"Path traversal in stored filename: {name!r}. Bug B3."

    def test_upload_file_exceeding_size_limit_rejected(self, authed_client):
        """A file exceeding the 10 MB limit should be rejected with 400/413."""
        large_content = b"x" * (11 * 1024 * 1024)  # 11 MB
        fake_file = io.BytesIO(large_content)
        fake_file.name = "large.txt"  # text/plain is whitelisted; size check must trigger
        resp = authed_client._client.post(
            "/api/v1/attachments/upload",
            data={"file": fake_file},
            **authed_client._headers,
        )
        # Bug B3: currently returns 201 regardless of file size. Should be 400/413.
        assert resp.status_code in (
            400,
            413,
        ), f"Expected rejection of oversized file, got {resp.status_code}. Bug B3: no size limit."

    def test_upload_zero_byte_file_succeeds(self, authed_client):
        """A zero-byte file is an edge case but should not crash the server."""
        fake_file = io.BytesIO(b"")
        fake_file.name = "empty.txt"
        resp = authed_client._client.post(
            "/api/v1/attachments/upload",
            data={"file": fake_file},
            **authed_client._headers,
        )
        # Zero-byte files may be allowed or rejected — the server must not 500.
        assert resp.status_code != 500, "Zero-byte file upload must not cause a 500 error."


# ---------------------------------------------------------------------------
# B4 — Contact creation allows duplicate (user, email) pairs
# ---------------------------------------------------------------------------


class TestContactDuplicates:
    """Bug B4: POST /contacts/ allows the same email address for the same user."""

    def test_duplicate_contact_email_per_user_rejected(self, authed_client, account):
        """Creating two contacts with the same email for the same user should fail."""
        payload = {"email": "dup@example.com", "name": "First Contact"}
        resp1 = authed_client.post("/api/v1/contacts/", data=json.dumps(payload))
        assert resp1.status_code == 201, "First contact creation should succeed."

        resp2 = authed_client.post("/api/v1/contacts/", data=json.dumps(payload))
        # Bug B4: currently returns 201 (duplicate silently created). Should be 400/409.
        assert resp2.status_code in (400, 409), (
            f"Expected duplicate-email rejection, got {resp2.status_code}. "
            "Bug B4: no uniqueness constraint on (user, email)."
        )

    def test_same_email_different_users_is_allowed(
        self, authed_client, api_client, second_auth_headers, account, second_account
    ):
        """The same email address MAY exist for two different users."""
        payload = {"email": "shared@example.com", "name": "Contact"}
        resp1 = authed_client.post("/api/v1/contacts/", data=json.dumps(payload))
        assert resp1.status_code == 201

        resp2 = api_client.post(
            "/api/v1/contacts/",
            data=json.dumps(payload),
            content_type="application/json",
            **second_auth_headers,
        )
        assert (
            resp2.status_code == 201
        ), "Two different users should each be able to have the same email in their contacts."


# ---------------------------------------------------------------------------
# B5 — bulk addLabel with no labelIds silently skips (returns 200)
# ---------------------------------------------------------------------------


class TestBulkAddLabelSilentSkip:
    """Bug B5: addLabel with empty/missing labelIds returns 200 instead of error."""

    def test_addlabel_with_empty_labelids_returns_error(self, authed_client, account):
        """addLabel with labelIds=[] should be rejected (400/422)."""
        email = EmailFactory(account=account, folder="inbox")
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(email.uuid)],
                    "operation": "addLabel",
                    "labelIds": [],
                }
            ),
        )
        # Bug B5: currently returns 200 (silently does nothing). Should be 400/422.
        assert resp.status_code in (
            400,
            422,
        ), f"Expected error for addLabel with empty labelIds, got {resp.status_code}. Bug B5: silent skip."

    def test_addlabel_with_null_labelids_returns_error(self, authed_client, account):
        """addLabel with labelIds=null should be rejected (400/422)."""
        email = EmailFactory(account=account, folder="inbox")
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(email.uuid)],
                    "operation": "addLabel",
                    "labelIds": None,
                }
            ),
        )
        # Bug B5 variant: labelIds omitted entirely.
        assert resp.status_code in (
            400,
            422,
        ), f"Expected error for addLabel with null labelIds, got {resp.status_code}. Bug B5: silent skip."


# ---------------------------------------------------------------------------
# JWT hostile inputs
# ---------------------------------------------------------------------------


class TestStripHtmlHostile:
    """Bug B2: _strip_html leaves CDATA content when the regex stops at the first >."""

    def test_cdata_section_fully_stripped(self):
        """CDATA content must not appear in the preview."""
        from penguin_mail.api.routers.emails import _strip_html

        # <![CDATA[some > content]]> — the regex <[^>]+> stops at the first >
        # inside the CDATA, leaving " content]]>" in the output.
        result = _strip_html("<![CDATA[injected > script]]>")
        # Bug B2: currently returns " script]]>" — the > inside CDATA terminates
        # the regex match early. After the fix this should be an empty string.
        assert (
            "<" not in result and ">" not in result and "]]>" not in result
        ), f"CDATA was not fully stripped; result: {result!r}. Bug B2."

    def test_cdata_with_only_greater_than(self):
        """Edge case: CDATA containing only '>'."""
        from penguin_mail.api.routers.emails import _strip_html

        result = _strip_html("<![CDATA[>]]>")
        assert "]]>" not in result and ">" not in result, f"Lone > CDATA not stripped; result: {result!r}. Bug B2."


class TestJWTHostile:
    """Validate that malformed or tampered JWTs are rejected cleanly."""

    @pytest.fixture
    def client(self, db):
        return Client()

    def _make_token(self, payload):
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

    def test_integer_sub_in_jwt_is_rejected(self, client):
        """A JWT with sub=12345 (integer) should not crash — must return 401."""
        import datetime

        now = datetime.datetime.now(datetime.UTC)
        token = self._make_token(
            {
                "sub": 12345,
                "type": "access",
                "iat": now,
                "exp": now + datetime.timedelta(hours=1),
            }
        )
        resp = client.get("/api/v1/emails/", HTTP_AUTHORIZATION=f"Bearer {token}")
        assert resp.status_code == 401

    def test_missing_type_claim_rejected(self, client):
        """A JWT missing the 'type' claim should be rejected with 401."""
        import datetime

        now = datetime.datetime.now(datetime.UTC)
        token = self._make_token(
            {
                "sub": "00000000-0000-0000-0000-000000000000",
                "iat": now,
                "exp": now + datetime.timedelta(hours=1),
                # 'type' intentionally omitted
            }
        )
        resp = client.get("/api/v1/emails/", HTTP_AUTHORIZATION=f"Bearer {token}")
        assert resp.status_code == 401

    def test_expired_token_rejected(self, client):
        """Expired tokens must be rejected (regression guard)."""
        import datetime

        now = datetime.datetime.now(datetime.UTC)
        token = self._make_token(
            {
                "sub": "00000000-0000-0000-0000-000000000000",
                "type": "access",
                "iat": now - datetime.timedelta(hours=2),
                "exp": now - datetime.timedelta(hours=1),
            }
        )
        resp = client.get("/api/v1/emails/", HTTP_AUTHORIZATION=f"Bearer {token}")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Email creation with hostile subject / body content
# ---------------------------------------------------------------------------


class TestEmailCreateHostile:
    """Probe the email create endpoint with inputs the AI likely didn't validate."""

    def _create_payload(self, account, **overrides):
        base = {
            "accountId": str(account.uuid),
            "to": [{"name": "Recipient", "email": "to@example.com"}],
            "subject": "Test",
            "body": "Hello",
        }
        base.update(overrides)
        return base

    def test_100k_char_subject(self, authed_client, account):
        """A 100 000-char subject should be rejected with 422 or truncated — not 500."""
        payload = self._create_payload(account, subject="A" * 100_000)
        resp = authed_client.post("/api/v1/emails/", data=json.dumps(payload))
        assert resp.status_code != 500, "Oversized subject must not cause a 500 error."

    def test_null_byte_in_subject(self, authed_client, account):
        """A null byte in the subject should be rejected or sanitised — not 500."""
        payload = self._create_payload(account, subject="hello\x00world")
        resp = authed_client.post("/api/v1/emails/", data=json.dumps(payload))
        assert resp.status_code != 500, "Null byte in subject must not cause a 500 error."

    def test_unicode_rtl_override_in_subject(self, authed_client, account):
        """RTL override characters are valid Unicode and should be stored without error."""
        payload = self._create_payload(account, subject="Normal \u202e \u200f subject")
        resp = authed_client.post("/api/v1/emails/", data=json.dumps(payload))
        # RTL override is valid — should succeed (201)
        assert resp.status_code == 201, f"RTL override in subject should succeed, got {resp.status_code}."

    def test_sql_injection_string_stored_as_literal(self, authed_client, account):
        """Classic SQL injection string should be stored as a literal — not executed."""
        payload = self._create_payload(account, subject="'; DROP TABLE emails; --")
        resp = authed_client.post("/api/v1/emails/", data=json.dumps(payload))
        assert resp.status_code == 201
        data = resp.json()
        assert data["subject"] == "'; DROP TABLE emails; --"

    def test_unicode_email_recipient(self, authed_client, account):
        """A Unicode email recipient should not cause a 500."""
        payload = self._create_payload(
            account,
            to=[{"name": "测试", "email": "测试@example.com"}],
        )
        resp = authed_client.post("/api/v1/emails/", data=json.dumps(payload))
        # May succeed or return 422 for invalid email format — must not 500.
        assert resp.status_code != 500, "Unicode email recipient must not cause a 500 error."
