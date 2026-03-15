"""Tests for settings API endpoints."""

import json

from factories import FilterRuleFactory, KeyboardShortcutFactory, SignatureFactory
from penguin_mail.models import BlockedAddress, FilterRule, Signature, UserSettings


class TestGetSettings:
    def test_returns_defaults(self, authed_client, user):
        resp = authed_client.get("/api/v1/settings/")
        assert resp.status_code == 200
        data = resp.json()
        assert "appearance" in data
        assert "notifications" in data
        assert "signatures" in data
        assert "filters" in data
        assert "blockedAddresses" in data

    def test_returns_custom_settings(self, authed_client, user):
        UserSettings.objects.create(
            user=user,
            appearance={"theme": "dark"},
        )
        resp = authed_client.get("/api/v1/settings/")
        assert resp.json()["appearance"]["theme"] == "dark"


class TestUpdateSettings:
    def test_update_appearance(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps({"appearance": {"theme": "dark"}}),
        )
        assert resp.status_code == 200
        assert resp.json()["appearance"]["theme"] == "dark"

    def test_merge_behavior(self, authed_client, user):
        """Updating one field shouldn't clear others."""
        authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps({"appearance": {"theme": "dark"}}),
        )
        authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps({"appearance": {"density": "compact"}}),
        )
        resp = authed_client.get("/api/v1/settings/")
        appearance = resp.json()["appearance"]
        assert appearance["theme"] == "dark"
        assert appearance["density"] == "compact"

    def test_update_notifications(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps({"notifications": {"emailNotifications": False}}),
        )
        assert resp.status_code == 200

    def test_update_inbox_behavior(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps({"inboxBehavior": {"conversationView": False}}),
        )
        assert resp.status_code == 200


class TestResetSettings:
    def test_resets_to_defaults(self, authed_client, user):
        UserSettings.objects.create(user=user, appearance={"theme": "dark"})
        resp = authed_client.post("/api/v1/settings/reset")
        assert resp.status_code == 200
        # After reset, should return defaults
        us = UserSettings.objects.get(user=user)
        assert us.appearance == {}


class TestUpdateSettingsAdditional:
    def test_update_language(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps({"language": {"language": "es"}}),
        )
        assert resp.status_code == 200

    def test_update_vacation_responder(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps({"vacationResponder": {"enabled": True, "message": "OOO"}}),
        )
        assert resp.status_code == 200

    def test_update_multiple_sections(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/",
            data=json.dumps(
                {
                    "appearance": {"theme": "dark"},
                    "notifications": {"emailNotifications": False},
                }
            ),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["appearance"]["theme"] == "dark"


class TestSignatures:
    def test_create(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/settings/signatures",
            data=json.dumps({"name": "Work", "content": "<p>Regards</p>"}),
        )
        assert resp.status_code == 201
        assert any(s["name"] == "Work" for s in resp.json()["signatures"])

    def test_create_default_clears_others(self, authed_client, user):
        SignatureFactory(user=user, is_default=True)
        authed_client.post(
            "/api/v1/settings/signatures",
            data=json.dumps({"name": "New Default", "content": "x", "isDefault": True}),
        )
        sigs = Signature.objects.filter(user=user)
        defaults = [s for s in sigs if s.is_default]
        assert len(defaults) == 1
        assert defaults[0].name == "New Default"

    def test_update_content(self, authed_client, user):
        sig = SignatureFactory(user=user)
        resp = authed_client.patch(
            f"/api/v1/settings/signatures/{sig.pk}",
            data=json.dumps({"name": "Updated", "content": "<p>New</p>"}),
        )
        assert resp.status_code == 200

    def test_update_unset_default(self, authed_client, user):
        sig = SignatureFactory(user=user, is_default=True)
        resp = authed_client.patch(
            f"/api/v1/settings/signatures/{sig.pk}",
            data=json.dumps({"isDefault": False}),
        )
        assert resp.status_code == 200
        sig.refresh_from_db()
        assert sig.is_default is False

    def test_delete(self, authed_client, user):
        sig = SignatureFactory(user=user)
        resp = authed_client.delete(f"/api/v1/settings/signatures/{sig.pk}")
        assert resp.status_code == 200
        assert not Signature.objects.filter(pk=sig.pk).exists()

    def test_update_not_found(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/signatures/99999",
            data=json.dumps({"name": "X"}),
        )
        assert resp.status_code == 404

    def test_delete_not_found(self, authed_client, user):
        resp = authed_client.delete("/api/v1/settings/signatures/99999")
        assert resp.status_code == 404

    def test_update_set_default(self, authed_client, user):
        s1 = SignatureFactory(user=user, is_default=True)
        s2 = SignatureFactory(user=user, is_default=False)
        authed_client.patch(
            f"/api/v1/settings/signatures/{s2.pk}",
            data=json.dumps({"isDefault": True}),
        )
        s1.refresh_from_db()
        s2.refresh_from_db()
        assert s2.is_default is True
        assert s1.is_default is False


class TestFilters:
    def test_create(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/settings/filters",
            data=json.dumps(
                {
                    "name": "Auto-archive",
                    "conditions": [{"field": "from", "operator": "contains", "value": "noreply"}],
                    "actions": [{"type": "moveTo", "value": "archive"}],
                }
            ),
        )
        assert resp.status_code == 201

    def test_update(self, authed_client, user):
        f = FilterRuleFactory(user=user)
        resp = authed_client.patch(
            f"/api/v1/settings/filters/{f.pk}",
            data=json.dumps({"name": "Updated", "enabled": False}),
        )
        assert resp.status_code == 200

    def test_update_all_fields(self, authed_client, user):
        f = FilterRuleFactory(user=user)
        resp = authed_client.patch(
            f"/api/v1/settings/filters/{f.pk}",
            data=json.dumps(
                {
                    "conditions": [{"field": "subject", "operator": "contains", "value": "test"}],
                    "matchAll": False,
                    "actions": [{"type": "label", "value": "important"}],
                }
            ),
        )
        assert resp.status_code == 200

    def test_delete(self, authed_client, user):
        f = FilterRuleFactory(user=user)
        resp = authed_client.delete(f"/api/v1/settings/filters/{f.pk}")
        assert resp.status_code == 200
        assert not FilterRule.objects.filter(pk=f.pk).exists()

    def test_update_not_found(self, authed_client, user):
        resp = authed_client.patch(
            "/api/v1/settings/filters/99999",
            data=json.dumps({"name": "X"}),
        )
        assert resp.status_code == 404

    def test_delete_not_found(self, authed_client, user):
        resp = authed_client.delete("/api/v1/settings/filters/99999")
        assert resp.status_code == 404


class TestBlockedAddresses:
    def test_block(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/settings/blocked-addresses",
            data=json.dumps({"email": "Spam@Evil.com"}),
        )
        assert resp.status_code == 201
        assert BlockedAddress.objects.filter(user=user, email="spam@evil.com").exists()

    def test_unblock(self, authed_client, user):
        BlockedAddress.objects.create(user=user, email="spam@evil.com")
        resp = authed_client.delete("/api/v1/settings/blocked-addresses/spam@evil.com")
        assert resp.status_code == 200
        assert not BlockedAddress.objects.filter(user=user, email="spam@evil.com").exists()

    def test_unblock_not_found(self, authed_client, user):
        resp = authed_client.delete("/api/v1/settings/blocked-addresses/nobody@example.com")
        assert resp.status_code == 404


class TestKeyboardShortcuts:
    def test_update(self, authed_client, api_client, auth_headers, user):
        ks = KeyboardShortcutFactory(user=user)
        resp = api_client.patch(
            f"/api/v1/settings/keyboard-shortcuts/{ks.pk}?enabled=false&key=x",
            **auth_headers,
        )
        assert resp.status_code == 200

    def test_update_modifiers(self, api_client, auth_headers, user):
        from django.test import RequestFactory

        from penguin_mail.api.routers.settings import update_shortcut

        ks = KeyboardShortcutFactory(user=user, modifiers=["ctrl"])
        # Call the view function directly with modifiers param
        rf = RequestFactory()
        request = rf.patch(f"/api/v1/settings/keyboard-shortcuts/{ks.pk}")
        request.auth = user
        update_shortcut(request, shortcut_id=ks.pk, modifiers=["alt", "shift"])
        ks.refresh_from_db()
        assert ks.modifiers == ["alt", "shift"]

    def test_not_found(self, api_client, auth_headers, user):
        resp = api_client.patch(
            "/api/v1/settings/keyboard-shortcuts/99999?key=x",
            **auth_headers,
        )
        assert resp.status_code == 404


class TestBlockedAddressesExtra:
    def test_duplicate_block_is_idempotent(self, authed_client, user):
        authed_client.post(
            "/api/v1/settings/blocked-addresses",
            data=json.dumps({"email": "spam@evil.com"}),
        )
        resp = authed_client.post(
            "/api/v1/settings/blocked-addresses",
            data=json.dumps({"email": "spam@evil.com"}),
        )
        assert resp.status_code == 201
        assert BlockedAddress.objects.filter(user=user, email="spam@evil.com").count() == 1

    def test_case_normalization(self, authed_client, user):
        authed_client.post(
            "/api/v1/settings/blocked-addresses",
            data=json.dumps({"email": "UPPER@CASE.COM"}),
        )
        assert BlockedAddress.objects.filter(user=user, email="upper@case.com").exists()


class TestFilterCreateFull:
    def test_create_with_full_conditions(self, authed_client, user):
        resp = authed_client.post(
            "/api/v1/settings/filters",
            data=json.dumps(
                {
                    "name": "Complex filter",
                    "enabled": True,
                    "conditions": [
                        {"field": "from", "operator": "contains", "value": "noreply"},
                        {"field": "subject", "operator": "contains", "value": "newsletter"},
                    ],
                    "matchAll": True,
                    "actions": [
                        {"type": "moveTo", "value": "archive"},
                        {"type": "label", "value": "newsletters"},
                    ],
                }
            ),
        )
        assert resp.status_code == 201
        f = FilterRule.objects.get(user=user, name="Complex filter")
        assert len(f.conditions) == 2
        assert len(f.actions) == 2
        assert f.match_all is True

    def test_partial_update_preserves_unset_fields(self, authed_client, user):
        f = FilterRuleFactory(user=user, name="Original", enabled=True)
        authed_client.patch(
            f"/api/v1/settings/filters/{f.pk}",
            data=json.dumps({"name": "Renamed"}),
        )
        f.refresh_from_db()
        assert f.name == "Renamed"
        assert f.enabled is True  # Unchanged


class TestKeyboardShortcutsExtra:
    def test_update_key_and_enabled(self, api_client, auth_headers, user):
        ks = KeyboardShortcutFactory(user=user, key="c", enabled=True)
        resp = api_client.patch(
            f"/api/v1/settings/keyboard-shortcuts/{ks.pk}?key=n&enabled=false",
            **auth_headers,
        )
        assert resp.status_code == 200
        ks.refresh_from_db()
        assert ks.key == "n"
        assert ks.enabled is False
