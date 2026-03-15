"""Tests for Django admin interface — basic smoke tests."""

import sys

import pytest
from django.contrib.admin.sites import site as admin_site
from django.test import Client

from factories import (
    AccountFactory,
    ContactFactory,
    EmailFactory,
    UserFactory,
    UserSettingsFactory,
)

# Django 5.1 has a template context copy bug on Python 3.14+, so admin views
# that render templates will crash.  We detect this and skip the affected tests.
_ADMIN_RENDER_BROKEN = sys.version_info >= (3, 14)
_skip_reason = "Django 5.1 admin template rendering incompatible with Python 3.14+"


@pytest.fixture
def admin_client(db):
    admin = UserFactory(is_staff=True, is_superuser=True)
    client = Client()
    client.force_login(admin)
    return client


ADMIN_MODELS = [
    ("penguin_mail", "user"),
    ("penguin_mail", "account"),
    ("penguin_mail", "email"),
    ("penguin_mail", "recipient"),
    ("penguin_mail", "attachment"),
    ("penguin_mail", "label"),
    ("penguin_mail", "customfolder"),
    ("penguin_mail", "contact"),
    ("penguin_mail", "contactgroup"),
    ("penguin_mail", "usersettings"),
    ("penguin_mail", "signature"),
    ("penguin_mail", "filterrule"),
    ("penguin_mail", "keyboardshortcut"),
]


class TestAdminRegistration:
    """Verify all 13 models are registered with the admin site."""

    def test_all_models_registered(self, db):
        registered_names = {model.__name__.lower() for model in admin_site._registry}
        expected = {m for _, m in ADMIN_MODELS}
        assert expected.issubset(registered_names), f"Missing from admin: {expected - registered_names}"


@pytest.mark.skipif(_ADMIN_RENDER_BROKEN, reason=_skip_reason)
class TestAdminListViews:
    @pytest.mark.parametrize("app,model", ADMIN_MODELS)
    def test_list_view_loads(self, admin_client, app, model):
        resp = admin_client.get(f"/admin/{app}/{model}/")
        assert resp.status_code == 200


@pytest.mark.skipif(_ADMIN_RENDER_BROKEN, reason=_skip_reason)
class TestAdminDetailViews:
    def test_user_detail(self, admin_client, db):
        user = UserFactory()
        resp = admin_client.get(f"/admin/penguin_mail/user/{user.pk}/change/")
        assert resp.status_code == 200

    def test_email_detail(self, admin_client, db):
        email = EmailFactory()
        resp = admin_client.get(f"/admin/penguin_mail/email/{email.pk}/change/")
        assert resp.status_code == 200

    def test_account_detail(self, admin_client, db):
        account = AccountFactory()
        resp = admin_client.get(f"/admin/penguin_mail/account/{account.pk}/change/")
        assert resp.status_code == 200

    def test_contact_detail(self, admin_client, db):
        contact = ContactFactory()
        resp = admin_client.get(f"/admin/penguin_mail/contact/{contact.pk}/change/")
        assert resp.status_code == 200

    def test_settings_detail(self, admin_client, db):
        settings = UserSettingsFactory()
        resp = admin_client.get(f"/admin/penguin_mail/usersettings/{settings.pk}/change/")
        assert resp.status_code == 200
