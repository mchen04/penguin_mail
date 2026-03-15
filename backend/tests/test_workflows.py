"""Integration tests covering full email workflows."""

import json

import pytest

from factories import EmailFactory, LabelFactory


@pytest.mark.django_db
class TestEmailWorkflow:
    def test_compose_and_verify_in_sent(self, authed_client, account):
        """Compose an email and verify it appears in sent folder."""
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "bob@example.com", "name": "Bob"}],
                    "subject": "Workflow Test",
                    "body": "<p>Hello Bob</p>",
                }
            ),
        )
        assert resp.status_code == 201
        email_id = resp.json()["id"]

        sent_resp = authed_client.get("/api/v1/emails/?folder=sent")
        assert sent_resp.status_code == 200
        ids = [e["id"] for e in sent_resp.json()["data"]]
        assert email_id in ids

    def test_send_then_star_archive(self, authed_client, account):
        """Create inbox email → mark unread → star → archive → verify folder=archive."""
        email = EmailFactory(account=account, folder="inbox", is_read=True)

        # Mark unread
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"isRead": False}),
        )
        assert resp.status_code == 200
        assert resp.json()["isRead"] is False

        # Star it
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"isStarred": True}),
        )
        assert resp.status_code == 200
        assert resp.json()["isStarred"] is True

        # Archive it
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"folder": "archive"}),
        )
        assert resp.status_code == 200
        assert resp.json()["folder"] == "archive"

        # Verify it appears in archive
        archive_resp = authed_client.get("/api/v1/emails/?folder=archive")
        ids = [e["id"] for e in archive_resp.json()["data"]]
        assert str(email.uuid) in ids

    def test_move_to_folder_add_label_search(self, authed_client, account, user):
        """Move email → add label → search → verify email appears."""
        label = LabelFactory(user=user, name="Important")
        email = EmailFactory(account=account, folder="inbox", subject="Project Alpha Update")

        # Move to archive folder
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"folder": "archive"}),
        )
        assert resp.status_code == 200

        # Add label via POST /labels endpoint
        resp = authed_client.post(
            f"/api/v1/emails/{email.uuid}/labels",
            data=json.dumps({"labelIds": [str(label.uuid)]}),
        )
        assert resp.status_code == 200

        # Search for the email
        search_resp = authed_client.get("/api/v1/emails/?search=Project+Alpha")
        assert search_resp.status_code == 200
        ids = [e["id"] for e in search_resp.json()["data"]]
        assert str(email.uuid) in ids

    def test_draft_create_and_verify_in_drafts(self, authed_client, account):
        """Create draft → verify in drafts → move to trash → verify not in drafts."""
        # Create a draft
        resp = authed_client.post(
            "/api/v1/emails/draft",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "alice@example.com"}],
                    "subject": "Draft Subject",
                    "body": "<p>Draft body</p>",
                }
            ),
        )
        assert resp.status_code == 201
        draft = resp.json()
        draft_id = draft["id"]
        assert draft["folder"] == "drafts"

        # Verify it appears in drafts
        drafts_resp = authed_client.get("/api/v1/emails/?folder=drafts")
        ids = [e["id"] for e in drafts_resp.json()["data"]]
        assert draft_id in ids

        # Move to trash (simulate abandoning draft)
        resp = authed_client.patch(
            f"/api/v1/emails/{draft_id}",
            data=json.dumps({"folder": "trash"}),
        )
        assert resp.status_code == 200
        assert resp.json()["folder"] == "trash"

        # Verify it's no longer in drafts
        drafts_resp = authed_client.get("/api/v1/emails/?folder=drafts")
        ids = [e["id"] for e in drafts_resp.json()["data"]]
        assert draft_id not in ids
