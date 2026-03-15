"""Tests for label API endpoints."""

import json
import uuid

import pytest

from factories import LabelFactory
from penguin_mail.models import Label


@pytest.fixture
def label(user):
    return LabelFactory(user=user, name="Important")


class TestListLabels:
    def test_list_labels_query_count(self, authed_client, user, django_assert_num_queries):
        for i in range(5):
            LabelFactory(user=user, name=f"Label {i}")
        # list_labels: 1 auth SELECT + 1 SELECT labels
        with django_assert_num_queries(2):
            resp = authed_client.get("/api/v1/labels/")
        assert resp.status_code == 200
        assert len(resp.json()) == 5

    def test_empty(self, authed_client, user):
        resp = authed_client.get("/api/v1/labels/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_with_data(self, authed_client, label):
        resp = authed_client.get("/api/v1/labels/")
        assert len(resp.json()) == 1
        assert resp.json()[0]["name"] == "Important"


class TestGetLabel:
    def test_success(self, authed_client, label):
        resp = authed_client.get(f"/api/v1/labels/{label.uuid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Important"

    def test_not_found(self, authed_client, user):
        resp = authed_client.get(f"/api/v1/labels/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestCreateLabel:
    def test_success(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/labels/",
            data=json.dumps({"name": "Urgent", "color": "red"}),
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "Urgent"
        assert resp.json()["color"] == "red"


class TestUpdateLabel:
    def test_success(self, authed_client, label):
        resp = authed_client.patch(
            f"/api/v1/labels/{label.uuid}",
            data=json.dumps({"name": "Updated"}),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated"

    def test_update_color(self, authed_client, label):
        resp = authed_client.patch(
            f"/api/v1/labels/{label.uuid}",
            data=json.dumps({"color": "blue"}),
        )
        assert resp.status_code == 200
        assert resp.json()["color"] == "blue"


class TestDeleteLabel:
    def test_success(self, authed_client, label):
        resp = authed_client.delete(f"/api/v1/labels/{label.uuid}")
        assert resp.status_code == 200
        assert not Label.objects.filter(pk=label.pk).exists()

    def test_not_found(self, authed_client):
        resp = authed_client.delete(f"/api/v1/labels/{uuid.uuid4()}")
        assert resp.status_code == 404
