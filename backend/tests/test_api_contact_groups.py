"""Tests for contact group API endpoints."""

import json
import uuid

import pytest

from factories import ContactGroupFactory
from penguin_mail.models import ContactGroup


@pytest.fixture
def group(user):
    return ContactGroupFactory(user=user, name="Team")


class TestListGroups:
    def test_empty(self, authed_client, user):
        resp = authed_client.get("/api/v1/contact-groups/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_with_data(self, authed_client, group):
        resp = authed_client.get("/api/v1/contact-groups/")
        assert len(resp.json()) == 1
        assert resp.json()[0]["name"] == "Team"


class TestGetGroup:
    def test_success(self, authed_client, group):
        resp = authed_client.get(f"/api/v1/contact-groups/{group.uuid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Team"

    def test_not_found(self, authed_client, user):
        resp = authed_client.get(f"/api/v1/contact-groups/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestCreateGroup:
    def test_success(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/contact-groups/",
            data=json.dumps({"name": "Work", "color": "blue"}),
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "Work"


class TestUpdateGroup:
    def test_update_color(self, authed_client, group):
        resp = authed_client.patch(
            f"/api/v1/contact-groups/{group.uuid}",
            data=json.dumps({"color": "red"}),
        )
        assert resp.status_code == 200
        assert resp.json()["color"] == "red"

    def test_success(self, authed_client, group):
        resp = authed_client.patch(
            f"/api/v1/contact-groups/{group.uuid}",
            data=json.dumps({"name": "Updated"}),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated"


class TestDeleteGroup:
    def test_success(self, authed_client, group):
        resp = authed_client.delete(f"/api/v1/contact-groups/{group.uuid}")
        assert resp.status_code == 200
        assert not ContactGroup.objects.filter(pk=group.pk).exists()

    def test_not_found(self, authed_client):
        resp = authed_client.delete(f"/api/v1/contact-groups/{uuid.uuid4()}")
        assert resp.status_code == 404
