"""Tests for custom folder API endpoints."""

import json
import uuid

import pytest

from factories import CustomFolderFactory
from penguin_mail.models import CustomFolder


@pytest.fixture
def folder(user):
    return CustomFolderFactory(user=user, name="Projects")


class TestListFolders:
    def test_list_folders_query_count(self, authed_client, user, django_assert_num_queries):
        for i in range(5):
            CustomFolderFactory(user=user, name=f"Folder {i}")
        # list_folders uses select_related("parent") — should be 2 queries regardless of count:
        # 1: auth (SELECT user), 2: SELECT folders JOIN parent
        with django_assert_num_queries(2):
            resp = authed_client.get("/api/v1/folders/")
        assert resp.status_code == 200
        assert len(resp.json()) == 5

    def test_empty(self, authed_client, user):
        resp = authed_client.get("/api/v1/folders/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_with_data(self, authed_client, folder):
        resp = authed_client.get("/api/v1/folders/")
        assert len(resp.json()) == 1


class TestGetFolder:
    def test_success(self, authed_client, folder):
        resp = authed_client.get(f"/api/v1/folders/{folder.uuid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Projects"

    def test_not_found(self, authed_client, user):
        resp = authed_client.get(f"/api/v1/folders/{uuid.uuid4()}")
        assert resp.status_code == 404


class TestCreateFolder:
    def test_success(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/folders/",
            data=json.dumps({"name": "Archive", "color": "green"}),
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "Archive"

    def test_with_parent(self, authed_client, folder):
        resp = authed_client.post(
            "/api/v1/folders/",
            data=json.dumps({"name": "Subfolder", "parentId": str(folder.uuid)}),
        )
        assert resp.status_code == 201
        assert resp.json()["parentId"] == str(folder.uuid)

    def test_invalid_parent(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/folders/",
            data=json.dumps({"name": "Bad", "parentId": str(uuid.uuid4())}),
        )
        assert resp.status_code == 404


class TestCreateFolderErrors:
    def test_missing_name(self, authed_client, user):
        """name is required in the folder schema."""
        resp = authed_client.post(
            "/api/v1/folders/",
            data=json.dumps({"color": "red"}),
        )
        assert resp.status_code == 422

    def test_malformed_json(self, authed_client, user):
        """Malformed JSON body returns a parse error."""
        resp = authed_client.post(
            "/api/v1/folders/",
            data="not json",
        )
        assert resp.status_code in (400, 422)


class TestUpdateFolder:
    def test_update_color(self, authed_client, folder):
        resp = authed_client.patch(
            f"/api/v1/folders/{folder.uuid}",
            data=json.dumps({"color": "red"}),
        )
        assert resp.status_code == 200
        assert resp.json()["color"] == "red"

    def test_success(self, authed_client, folder):
        resp = authed_client.patch(
            f"/api/v1/folders/{folder.uuid}",
            data=json.dumps({"name": "Renamed"}),
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Renamed"


class TestDeleteFolder:
    def test_success(self, authed_client, folder):
        resp = authed_client.delete(f"/api/v1/folders/{folder.uuid}")
        assert resp.status_code == 200
        assert not CustomFolder.objects.filter(pk=folder.pk).exists()


class TestReorderFolder:
    def test_reorder(self, authed_client, user):
        f1 = CustomFolderFactory(user=user, name="A", order=0)
        f2 = CustomFolderFactory(user=user, name="B", order=1)
        f3 = CustomFolderFactory(user=user, name="C", order=2)

        resp = authed_client.post(f"/api/v1/folders/{f3.uuid}/reorder?newOrder=0")
        assert resp.status_code == 200

        f1.refresh_from_db()
        f2.refresh_from_db()
        f3.refresh_from_db()
        assert f3.order == 0
        assert f1.order == 1
        assert f2.order == 2
