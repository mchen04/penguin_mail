"""Tests for contact API endpoints."""

import json

import pytest

from factories import ContactFactory, ContactGroupFactory
from penguin_mail.models import Contact


@pytest.fixture
def contact(user):
    return ContactFactory(user=user, name="Alice Smith", email="alice@example.com", company="Acme")


@pytest.fixture
def group(user):
    return ContactGroupFactory(user=user, name="Friends")


class TestListContacts:
    def test_list_contacts_query_count(self, authed_client, user, django_assert_num_queries):
        for i in range(10):
            g = ContactGroupFactory(user=user, name=f"Group {i}")
            c = ContactFactory(user=user, email=f"c{i}@e.com")
            g.contacts.add(c)
        with django_assert_num_queries(4):
            resp = authed_client.get("/api/v1/contacts/")
        assert resp.status_code == 200
        assert resp.json()["total"] == 10

    def test_empty(self, authed_client, user):
        resp = authed_client.get("/api/v1/contacts/")
        assert resp.status_code == 200
        assert resp.json()["data"] == []

    def test_with_data(self, authed_client, contact):
        resp = authed_client.get("/api/v1/contacts/")
        data = resp.json()
        assert len(data["data"]) == 1
        assert data["data"][0]["name"] == "Alice Smith"

    def test_pagination(self, authed_client, user):
        for i in range(5):
            ContactFactory(user=user, name=f"Contact {i}", email=f"c{i}@e.com")
        resp = authed_client.get("/api/v1/contacts/?page=1&pageSize=2")
        data = resp.json()
        assert len(data["data"]) == 2
        assert data["total"] == 5

    def test_user_isolation(self, authed_client, contact, second_user):
        ContactFactory(user=second_user, name="Other")
        resp = authed_client.get("/api/v1/contacts/")
        assert resp.json()["total"] == 1


class TestSearchContacts:
    def test_by_name(self, authed_client, contact):
        resp = authed_client.get("/api/v1/contacts/search?q=alice")
        assert resp.json()["total"] == 1

    def test_by_email(self, authed_client, contact):
        resp = authed_client.get("/api/v1/contacts/search?q=alice@example")
        assert resp.json()["total"] == 1

    def test_by_company(self, authed_client, contact):
        resp = authed_client.get("/api/v1/contacts/search?q=acme")
        assert resp.json()["total"] == 1

    def test_no_results(self, authed_client, contact):
        resp = authed_client.get("/api/v1/contacts/search?q=zzzzz")
        assert resp.json()["total"] == 0


class TestGetFavorites:
    def test_only_favorites(self, authed_client, user):
        ContactFactory(user=user, is_favorite=True, email="fav@e.com")
        ContactFactory(user=user, is_favorite=False, email="nonfav@e.com")
        resp = authed_client.get("/api/v1/contacts/favorites")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


class TestGetContact:
    def test_success(self, authed_client, contact):
        resp = authed_client.get(f"/api/v1/contacts/{contact.uuid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Alice Smith"

    def test_not_found(self, authed_client, user):
        import uuid

        resp = authed_client.get(f"/api/v1/contacts/{uuid.uuid4()}")
        assert resp.status_code == 404

    def test_other_users_contact(self, authed_client, second_user):
        other = ContactFactory(user=second_user, email="other@e.com")
        resp = authed_client.get(f"/api/v1/contacts/{other.uuid}")
        assert resp.status_code == 404


class TestGetByEmail:
    def test_success(self, authed_client, contact):
        resp = authed_client.get("/api/v1/contacts/by-email/alice@example.com")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Alice Smith"

    def test_not_found(self, authed_client, user):
        resp = authed_client.get("/api/v1/contacts/by-email/nobody@example.com")
        assert resp.status_code == 404


class TestGetByGroup:
    def test_success(self, authed_client, contact, group):
        group.contacts.add(contact)
        resp = authed_client.get(f"/api/v1/contacts/by-group/{group.uuid}")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_empty_group(self, authed_client, group):
        resp = authed_client.get(f"/api/v1/contacts/by-group/{group.uuid}")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_group_not_found(self, authed_client, user):
        import uuid

        resp = authed_client.get(f"/api/v1/contacts/by-group/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestCreateContact:
    def test_success(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/contacts/",
            data=json.dumps({"email": "new@example.com", "name": "New Contact"}),
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "New Contact"

    def test_with_group(self, authed_client, group):
        resp = authed_client.post(
            "/api/v1/contacts/",
            data=json.dumps(
                {
                    "email": "g@e.com",
                    "name": "Grouped",
                    "groups": [str(group.uuid)],
                }
            ),
        )
        assert resp.status_code == 201
        assert str(group.uuid) in resp.json()["groups"]


class TestCreateContactErrors:
    def test_missing_email(self, authed_client, user):
        """email is required in the contact schema."""
        resp = authed_client.post(
            "/api/v1/contacts/",
            data=json.dumps({"name": "No Email"}),
        )
        assert resp.status_code == 422

    def test_missing_name(self, authed_client, user):
        """name is required in the contact schema."""
        resp = authed_client.post(
            "/api/v1/contacts/",
            data=json.dumps({"email": "valid@example.com"}),
        )
        assert resp.status_code == 422

    def test_malformed_json(self, authed_client, user):
        """Malformed JSON body returns a parse error."""
        resp = authed_client.post(
            "/api/v1/contacts/",
            data="not json",
        )
        assert resp.status_code in (400, 422)


class TestUpdateContact:
    def test_update_query_count(self, authed_client, contact, django_assert_num_queries):
        # Simple update (no group changes) expected queries:
        # 1: auth SELECT user, 2: get_object_or_404 SELECT contact,
        # 3: UPDATE contact, 4: SELECT contact (re-fetch), 5: prefetch SELECT groups
        with django_assert_num_queries(5):
            resp = authed_client.patch(
                f"/api/v1/contacts/{contact.uuid}",
                data=json.dumps({"name": "Updated Name"}),
            )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    def test_update_name(self, authed_client, contact):
        resp = authed_client.patch(
            f"/api/v1/contacts/{contact.uuid}",
            data=json.dumps({"name": "Bob"}),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Bob"

    def test_update_groups(self, authed_client, contact, group):
        resp = authed_client.patch(
            f"/api/v1/contacts/{contact.uuid}",
            data=json.dumps({"groups": [str(group.uuid)]}),
        )
        assert resp.status_code == 200
        assert str(group.uuid) in resp.json()["groups"]

    def test_update_favorite(self, authed_client, contact):
        resp = authed_client.patch(
            f"/api/v1/contacts/{contact.uuid}",
            data=json.dumps({"isFavorite": True}),
        )
        assert resp.status_code == 200
        assert resp.json()["isFavorite"] is True

    def test_update_all_fields(self, authed_client, contact):
        resp = authed_client.patch(
            f"/api/v1/contacts/{contact.uuid}",
            data=json.dumps(
                {
                    "email": "new@example.com",
                    "avatar": "https://example.com/a.png",
                    "phone": "555-1234",
                    "company": "NewCo",
                    "notes": "Updated notes",
                }
            ),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert data["phone"] == "555-1234"
        assert data["company"] == "NewCo"
        assert data["notes"] == "Updated notes"

    def test_update_groups_removes_old(self, authed_client, contact, group, user):
        """Updating groups should remove from previous groups first."""
        group.contacts.add(contact)
        new_group = ContactGroupFactory(user=user, name="New Group")
        resp = authed_client.patch(
            f"/api/v1/contacts/{contact.uuid}",
            data=json.dumps({"groups": [str(new_group.uuid)]}),
        )
        assert resp.status_code == 200
        assert str(new_group.uuid) in resp.json()["groups"]
        assert str(group.uuid) not in resp.json()["groups"]

    def test_not_found(self, authed_client, user):
        import uuid

        resp = authed_client.patch(
            f"/api/v1/contacts/{uuid.uuid4()}",
            data=json.dumps({"name": "X"}),
        )
        assert resp.status_code == 404


class TestDeleteContact:
    def test_success(self, authed_client, contact):
        resp = authed_client.delete(f"/api/v1/contacts/{contact.uuid}")
        assert resp.status_code == 200
        assert not Contact.objects.filter(pk=contact.pk).exists()


class TestToggleFavorite:
    def test_toggle_on(self, authed_client, contact):
        assert contact.is_favorite is False
        resp = authed_client.post(f"/api/v1/contacts/{contact.uuid}/toggle-favorite")
        assert resp.status_code == 200
        assert resp.json()["isFavorite"] is True

    def test_toggle_off(self, authed_client, user):
        c = ContactFactory(user=user, is_favorite=True, email="fav@e.com")
        resp = authed_client.post(f"/api/v1/contacts/{c.uuid}/toggle-favorite")
        assert resp.json()["isFavorite"] is False


class TestContactGroupMembership:
    def test_add_to_group(self, authed_client, contact, group):
        resp = authed_client.post(f"/api/v1/contacts/{contact.uuid}/add-to-group/{group.uuid}")
        assert resp.status_code == 200
        assert contact in group.contacts.all()

    def test_remove_from_group(self, authed_client, contact, group):
        group.contacts.add(contact)
        resp = authed_client.post(f"/api/v1/contacts/{contact.uuid}/remove-from-group/{group.uuid}")
        assert resp.status_code == 200
        assert contact not in group.contacts.all()
