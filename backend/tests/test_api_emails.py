"""Tests for email API endpoints."""

import json
import uuid

import pytest

from factories import EmailFactory, LabelFactory, RecipientFactory
from penguin_mail.models import Account, Email


@pytest.fixture
def email(account):
    e = EmailFactory(account=account, subject="Test Email", folder="inbox")
    RecipientFactory(email=e, address="recipient@example.com", kind="TO")
    return e


class TestListEmails:
    def test_list_emails_query_count(self, authed_client, account, django_assert_num_queries):
        emails = [EmailFactory(account=account, folder="inbox") for _ in range(10)]
        for e in emails:
            RecipientFactory(email=e, kind="TO")
        with django_assert_num_queries(7):
            resp = authed_client.get("/api/v1/emails/?folder=inbox")
        assert resp.status_code == 200
        assert resp.json()["total"] == 10

    def test_empty(self, authed_client, account):
        resp = authed_client.get("/api/v1/emails/?folder=inbox")
        assert resp.status_code == 200
        data = resp.json()
        assert data["data"] == []
        assert data["total"] == 0

    def test_with_data(self, authed_client, email):
        resp = authed_client.get("/api/v1/emails/?folder=inbox")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 1
        assert data["data"][0]["subject"] == "Test Email"

    def test_filter_by_folder(self, authed_client, account):
        EmailFactory(account=account, folder="inbox")
        EmailFactory(account=account, folder="sent")
        resp = authed_client.get("/api/v1/emails/?folder=inbox")
        assert resp.json()["total"] == 1

    def test_filter_by_account(self, authed_client, account, user):
        other = Account.objects.create(user=user, email="second@example.com", name="Second")
        EmailFactory(account=account, folder="inbox")
        EmailFactory(account=other, folder="inbox")
        resp = authed_client.get(f"/api/v1/emails/?accountId={account.uuid}")
        assert resp.json()["total"] == 1

    def test_filter_is_read(self, authed_client, account):
        EmailFactory(account=account, is_read=True)
        EmailFactory(account=account, is_read=False)
        resp = authed_client.get("/api/v1/emails/?isRead=true")
        assert resp.json()["total"] == 1

    def test_filter_is_starred(self, authed_client, account):
        EmailFactory(account=account, is_starred=True)
        EmailFactory(account=account, is_starred=False)
        resp = authed_client.get("/api/v1/emails/?isStarred=true")
        assert resp.json()["total"] == 1

    def test_filter_has_attachment(self, authed_client, account):
        EmailFactory(account=account, has_attachment=True)
        EmailFactory(account=account, has_attachment=False)
        resp = authed_client.get("/api/v1/emails/?hasAttachment=true")
        assert resp.json()["total"] == 1

    def test_search(self, authed_client, account):
        EmailFactory(account=account, subject="Important meeting")
        EmailFactory(account=account, subject="Casual chat")
        resp = authed_client.get("/api/v1/emails/?search=important")
        assert resp.json()["total"] == 1

    def test_filter_by_thread(self, authed_client, account):
        tid = uuid.uuid4()
        EmailFactory(account=account, thread_id=tid)
        EmailFactory(account=account, thread_id=uuid.uuid4())
        resp = authed_client.get(f"/api/v1/emails/?threadId={tid}")
        assert resp.json()["total"] == 1

    def test_filter_by_label(self, authed_client, account, user):
        label = LabelFactory(user=user)
        e = EmailFactory(account=account)
        e.labels.add(label)
        EmailFactory(account=account)
        resp = authed_client.get(f"/api/v1/emails/?labelIds={label.uuid}")
        assert resp.json()["total"] == 1

    def test_filter_by_multiple_labels(self, authed_client, account, user):
        """Comma-separated labelIds uses AND semantics — only emails with ALL labels match."""
        label1 = LabelFactory(user=user)
        label2 = LabelFactory(user=user)
        e_both = EmailFactory(account=account)
        e_one = EmailFactory(account=account)
        EmailFactory(account=account)  # no labels
        e_both.labels.add(label1, label2)  # has both — should match
        e_one.labels.add(label1)  # has only label1 — should NOT match
        resp = authed_client.get(f"/api/v1/emails/?labelIds={label1.uuid},{label2.uuid}")
        data = resp.json()
        # The router chains .filter(labels__uuid=id) for each id → AND (intersection)
        assert data["total"] == 1
        assert data["data"][0]["id"] == str(e_both.uuid)

    def test_pagination(self, authed_client, account):
        for _ in range(5):
            EmailFactory(account=account)
        resp = authed_client.get("/api/v1/emails/?page=1&pageSize=2")
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["total"] == 5
        assert data["totalPages"] == 3

    def test_user_isolation(self, authed_client, account, second_account):
        EmailFactory(account=account, subject="Mine")
        EmailFactory(account=second_account, subject="Theirs")
        resp = authed_client.get("/api/v1/emails/")
        data = resp.json()
        assert data["total"] == 1
        assert data["data"][0]["subject"] == "Mine"


class TestCreateEmail:
    def test_success(self, authed_client, account):
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "bob@example.com", "name": "Bob"}],
                    "subject": "Hello",
                    "body": "<p>Hi Bob</p>",
                }
            ),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["subject"] == "Hello"
        assert data["folder"] == "sent"
        assert len(data["to"]) == 1

    def test_with_cc_bcc(self, authed_client, account):
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "a@b.com"}],
                    "cc": [{"email": "cc@b.com"}],
                    "bcc": [{"email": "bcc@b.com"}],
                    "subject": "Test",
                    "body": "Body",
                }
            ),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert len(data["cc"]) == 1
        assert len(data["bcc"]) == 1

    def test_scheduled_send(self, authed_client, account):
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Scheduled",
                    "body": "Later",
                    "scheduledSendAt": "2099-01-01T12:00:00Z",
                }
            ),
        )
        assert resp.status_code == 201
        assert resp.json()["folder"] == "scheduled"

    def test_invalid_account(self, authed_client):
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(uuid.uuid4()),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Test",
                    "body": "Body",
                }
            ),
        )
        assert resp.status_code == 404

    def test_reply(self, authed_client, account, email):
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Re: Test",
                    "body": "Reply body",
                    "replyToId": str(email.uuid),
                }
            ),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["replyToId"] == str(email.uuid)

    def test_forward(self, authed_client, account, email):
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Fwd: Test",
                    "body": "Forward body",
                    "forwardedFromId": str(email.uuid),
                }
            ),
        )
        assert resp.status_code == 201
        assert resp.json()["forwardedFromId"] == str(email.uuid)

    def test_reply_to_nonexistent_ignored(self, authed_client, account):
        """Replying to a nonexistent email should still create the email."""
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Re: Ghost",
                    "body": "Body",
                    "replyToId": str(uuid.uuid4()),
                }
            ),
        )
        assert resp.status_code == 201
        assert resp.json()["replyToId"] is None

    def test_forward_nonexistent_ignored(self, authed_client, account):
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Fwd: Ghost",
                    "body": "Body",
                    "forwardedFromId": str(uuid.uuid4()),
                }
            ),
        )
        assert resp.status_code == 201
        assert resp.json()["forwardedFromId"] is None


class TestCreateDraft:
    def test_success(self, authed_client, account):
        resp = authed_client.post(
            "/api/v1/emails/draft",
            data=json.dumps(
                {
                    "accountId": str(account.uuid),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Draft",
                    "body": "WIP",
                }
            ),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["folder"] == "drafts"
        assert data["isDraft"] is True

    def test_invalid_account(self, authed_client):
        resp = authed_client.post(
            "/api/v1/emails/draft",
            data=json.dumps(
                {
                    "accountId": str(uuid.uuid4()),
                    "to": [{"email": "a@b.com"}],
                    "subject": "Draft",
                    "body": "WIP",
                }
            ),
        )
        assert resp.status_code == 404


class TestGetEmail:
    def test_success(self, authed_client, email):
        resp = authed_client.get(f"/api/v1/emails/{email.uuid}")
        assert resp.status_code == 200
        assert resp.json()["subject"] == "Test Email"

    def test_not_found(self, authed_client):
        resp = authed_client.get(f"/api/v1/emails/{uuid.uuid4()}")
        assert resp.status_code == 404

    def test_other_users_email(self, authed_client, second_account):
        other_email = EmailFactory(account=second_account)
        resp = authed_client.get(f"/api/v1/emails/{other_email.uuid}")
        assert resp.status_code == 404


class TestUpdateEmail:
    def test_mark_read(self, authed_client, email):
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"isRead": True}),
        )
        assert resp.status_code == 200
        assert resp.json()["isRead"] is True

    def test_star(self, authed_client, email):
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"isStarred": True}),
        )
        assert resp.status_code == 200
        assert resp.json()["isStarred"] is True

    def test_move_folder(self, authed_client, email):
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"folder": "archive"}),
        )
        assert resp.status_code == 200
        assert resp.json()["folder"] == "archive"

    def test_set_labels(self, authed_client, email, user):
        label = LabelFactory(user=user)
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"labels": [str(label.uuid)]}),
        )
        assert resp.status_code == 200
        assert str(label.uuid) in resp.json()["labels"]

    def test_not_found(self, authed_client):
        resp = authed_client.patch(
            f"/api/v1/emails/{uuid.uuid4()}",
            data=json.dumps({"isRead": True}),
        )
        assert resp.status_code == 404


class TestDeleteEmail:
    def test_moves_to_trash(self, authed_client, email):
        resp = authed_client.delete(f"/api/v1/emails/{email.uuid}")
        assert resp.status_code == 200
        email.refresh_from_db()
        assert email.folder == "trash"

    def test_not_found(self, authed_client):
        resp = authed_client.delete(f"/api/v1/emails/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestDeleteEmailPermanent:
    def test_removes_from_db(self, authed_client, email):
        email_pk = email.pk
        resp = authed_client.delete(f"/api/v1/emails/{email.uuid}/permanent")
        assert resp.status_code == 200
        assert not Email.objects.filter(pk=email_pk).exists()

    def test_not_found(self, authed_client):
        resp = authed_client.delete(f"/api/v1/emails/{uuid.uuid4()}/permanent")
        assert resp.status_code == 404


class TestBulkOperation:
    def test_mark_read(self, authed_client, account):
        e1 = EmailFactory(account=account, is_read=False)
        e2 = EmailFactory(account=account, is_read=False)
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(e1.uuid), str(e2.uuid)],
                    "operation": "markRead",
                }
            ),
        )
        assert resp.status_code == 200
        e1.refresh_from_db()
        e2.refresh_from_db()
        assert e1.is_read is True
        assert e2.is_read is True

    def test_mark_unread(self, authed_client, account):
        e = EmailFactory(account=account, is_read=True)
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "markUnread"}),
        )
        assert resp.status_code == 200
        e.refresh_from_db()
        assert e.is_read is False

    def test_star(self, authed_client, account):
        e = EmailFactory(account=account, is_starred=False)
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "star"}),
        )
        e.refresh_from_db()
        assert e.is_starred is True

    def test_unstar(self, authed_client, account):
        e = EmailFactory(account=account, is_starred=True)
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "unstar"}),
        )
        e.refresh_from_db()
        assert e.is_starred is False

    def test_archive(self, authed_client, account):
        e = EmailFactory(account=account, folder="inbox")
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "archive"}),
        )
        e.refresh_from_db()
        assert e.folder == "archive"

    def test_delete(self, authed_client, account):
        e = EmailFactory(account=account)
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "delete"}),
        )
        e.refresh_from_db()
        assert e.folder == "trash"

    def test_delete_permanent(self, authed_client, account):
        e = EmailFactory(account=account)
        pk = e.pk
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "deletePermanent"}),
        )
        assert not Email.objects.filter(pk=pk).exists()

    def test_move(self, authed_client, account):
        e = EmailFactory(account=account, folder="inbox")
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "move", "folder": "archive"}),
        )
        e.refresh_from_db()
        assert e.folder == "archive"

    def test_add_label(self, authed_client, account, user):
        label = LabelFactory(user=user)
        e = EmailFactory(account=account)
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(e.uuid)],
                    "operation": "addLabel",
                    "labelIds": [str(label.uuid)],
                }
            ),
        )
        assert label in e.labels.all()

    def test_remove_label(self, authed_client, account, user):
        label = LabelFactory(user=user)
        e = EmailFactory(account=account)
        e.labels.add(label)
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(e.uuid)],
                    "operation": "removeLabel",
                    "labelIds": [str(label.uuid)],
                }
            ),
        )
        assert label not in e.labels.all()


class TestBulkOperationErrorPaths:
    def test_invalid_operation_type(self, authed_client, account):
        e = EmailFactory(account=account)
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "doesNotExist"}),
        )
        assert resp.status_code in (400, 422)

    def test_empty_ids_list(self, authed_client):
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [], "operation": "markRead"}),
        )
        # Empty bulk op should either succeed vacuously (200) or be rejected (400/422)
        assert resp.status_code in (200, 400, 422)

    def test_nonexistent_email_ids_are_silently_ignored(self, authed_client):
        fake_id = str(uuid.uuid4())
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [fake_id], "operation": "markRead"}),
        )
        # Non-existent IDs owned by no one — expect 200 (silently skipped) or 404
        assert resp.status_code in (200, 404)

    def test_cross_user_ids_are_ignored(self, authed_client, second_account):
        other_email = EmailFactory(account=second_account)
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(other_email.uuid)], "operation": "markRead"}),
        )
        assert resp.status_code in (200, 403, 404)
        # The other user's email must not be mutated
        other_email.refresh_from_db()
        assert other_email.is_read is False

    def test_move_operation_without_folder_field(self, authed_client, account):
        e = EmailFactory(account=account, folder="inbox")
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "move"}),
        )
        assert resp.status_code in (400, 422)

    def test_malformed_json_body(self, authed_client):
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data="not-valid-json",
            content_type="application/json",
        )
        assert resp.status_code in (400, 422)

    def test_missing_operation_field(self, authed_client, account):
        e = EmailFactory(account=account)
        resp = authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)]}),
        )
        assert resp.status_code in (400, 422)


class TestEmailLabels:
    def test_add_labels(self, authed_client, email, user):
        label = LabelFactory(user=user)
        resp = authed_client.post(
            f"/api/v1/emails/{email.uuid}/labels",
            data=json.dumps({"labelIds": [str(label.uuid)]}),
        )
        assert resp.status_code == 200
        assert label in email.labels.all()

    def test_remove_labels(self, authed_client, email, user):
        label = LabelFactory(user=user)
        email.labels.add(label)
        resp = authed_client.delete(
            f"/api/v1/emails/{email.uuid}/labels",
            data=json.dumps({"labelIds": [str(label.uuid)]}),
        )
        assert resp.status_code == 200
        assert label not in email.labels.all()

    def test_add_labels_not_found(self, authed_client, user):
        label = LabelFactory(user=user)
        resp = authed_client.post(
            f"/api/v1/emails/{uuid.uuid4()}/labels",
            data=json.dumps({"labelIds": [str(label.uuid)]}),
        )
        assert resp.status_code == 404

    def test_remove_labels_not_found(self, authed_client, user):
        label = LabelFactory(user=user)
        resp = authed_client.delete(
            f"/api/v1/emails/{uuid.uuid4()}/labels",
            data=json.dumps({"labelIds": [str(label.uuid)]}),
        )
        assert resp.status_code == 404


class TestSnoozeViaUpdate:
    def test_snooze_email(self, authed_client, email):
        """Setting snooze fields via update."""
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"folder": "snoozed"}),
        )
        assert resp.status_code == 200
        assert resp.json()["folder"] == "snoozed"


class TestSearchFields:
    def test_search_body(self, authed_client, account):
        EmailFactory(account=account, subject="Hello", body="<p>secret code 42</p>")
        EmailFactory(account=account, subject="Other", body="<p>nothing</p>")
        resp = authed_client.get("/api/v1/emails/?search=secret+code")
        assert resp.json()["total"] == 1

    def test_search_sender_name(self, authed_client, account):
        EmailFactory(account=account, sender_name="Zara Smith")
        EmailFactory(account=account, sender_name="John Doe")
        resp = authed_client.get("/api/v1/emails/?search=zara")
        assert resp.json()["total"] == 1

    def test_search_sender_email(self, authed_client, account):
        EmailFactory(account=account, sender_email="unique-addr@example.com")
        EmailFactory(account=account, sender_email="other@example.com")
        resp = authed_client.get("/api/v1/emails/?search=unique-addr")
        assert resp.json()["total"] == 1


class TestPaginationEdgeCases:
    def test_page_zero_returns_first_page(self, authed_client, account):
        EmailFactory(account=account)
        resp = authed_client.get("/api/v1/emails/?page=0&pageSize=10")
        # Should either return page 1 data or an error — not crash
        assert resp.status_code in (200, 422)

    def test_page_beyond_total(self, authed_client, account):
        EmailFactory(account=account)
        resp = authed_client.get("/api/v1/emails/?page=999&pageSize=10")
        assert resp.status_code == 200
        assert resp.json()["data"] == []


class TestCombinedFilters:
    def test_folder_and_starred_and_attachment(self, authed_client, account):
        e1 = EmailFactory(account=account, folder="inbox", is_starred=True, has_attachment=True)
        EmailFactory(account=account, folder="inbox", is_starred=True, has_attachment=False)
        EmailFactory(account=account, folder="inbox", is_starred=False, has_attachment=True)
        EmailFactory(account=account, folder="sent", is_starred=True, has_attachment=True)
        resp = authed_client.get("/api/v1/emails/?folder=inbox&isStarred=true&hasAttachment=true")
        data = resp.json()
        assert data["total"] == 1
        assert data["data"][0]["id"] == str(e1.uuid)


class TestDeleteAlreadyTrashed:
    def test_delete_trashed_email_stays_in_trash(self, authed_client, account):
        e = EmailFactory(account=account, folder="trash")
        resp = authed_client.delete(f"/api/v1/emails/{e.uuid}")
        assert resp.status_code == 200
        e.refresh_from_db()
        assert e.folder == "trash"


class TestCreateEmailErrors:
    def test_missing_account_id(self, authed_client):
        """accountId is required in the schema — omitting it returns 422."""
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps({"to": [{"email": "a@b.com"}], "subject": "Hi", "body": "Body"}),
        )
        assert resp.status_code == 422

    def test_missing_to_field(self, authed_client, account):
        """to is required in the schema — omitting it returns 422."""
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps({"accountId": str(account.uuid), "subject": "Hi", "body": "Body"}),
        )
        assert resp.status_code == 422

    def test_malformed_json(self, authed_client):
        """Malformed JSON body returns a parse error."""
        resp = authed_client.post(
            "/api/v1/emails/",
            data="{ bad json ::::",
        )
        assert resp.status_code in (400, 422)

    def test_recipient_missing_email_field(self, authed_client, account):
        """Each recipient in the to list must have an email field."""
        resp = authed_client.post(
            "/api/v1/emails/",
            data=json.dumps(
                {"accountId": str(account.uuid), "to": [{"name": "No Email"}], "subject": "Hi", "body": "Body"}
            ),
        )
        assert resp.status_code == 422


class TestBulkEdgeCases:
    def test_move_without_folder_is_noop(self, authed_client, account):
        e = EmailFactory(account=account, folder="inbox")
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps({"ids": [str(e.uuid)], "operation": "move"}),
        )
        e.refresh_from_db()
        assert e.folder == "inbox"  # Unchanged

    def test_add_label_with_other_users_label(self, authed_client, account, second_user):
        other_label = LabelFactory(user=second_user)
        e = EmailFactory(account=account)
        authed_client.post(
            "/api/v1/emails/bulk",
            data=json.dumps(
                {
                    "ids": [str(e.uuid)],
                    "operation": "addLabel",
                    "labelIds": [str(other_label.uuid)],
                }
            ),
        )
        assert other_label not in e.labels.all()
