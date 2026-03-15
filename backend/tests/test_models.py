"""Tests for Django models — creation, string representation, constraints, cascades."""

import pytest
from django.db import IntegrityError

from factories import (
    AccountFactory,
    AttachmentFactory,
    BlockedAddressFactory,
    ContactFactory,
    ContactGroupFactory,
    CustomFolderFactory,
    EmailFactory,
    FilterRuleFactory,
    KeyboardShortcutFactory,
    LabelFactory,
    RecipientFactory,
    SignatureFactory,
    UserFactory,
    UserSettingsFactory,
)
from penguin_mail.models import (
    Account,
    BlockedAddress,
    ContactGroup,
    CustomFolder,
    Email,
    KeyboardShortcut,
    Label,
    Recipient,
)


class TestUserModel:
    def test_create(self, db):
        user = UserFactory()
        assert user.pk is not None
        assert user.uuid is not None

    def test_str(self, db):
        user = UserFactory(username="alice")
        assert str(user) == "alice"


class TestAccountModel:
    def test_create(self, db):
        account = AccountFactory()
        assert account.pk is not None
        assert account.uuid is not None

    def test_str(self, db):
        account = AccountFactory(email="a@b.com", name="Main")
        assert str(account) == "a@b.com (Main)"

    def test_unique_user_email(self, db):
        account = AccountFactory()
        with pytest.raises(IntegrityError):
            Account.objects.create(
                user=account.user,
                email=account.email,
                name="Duplicate",
            )


class TestEmailModel:
    def test_create(self, db):
        email = EmailFactory()
        assert email.pk is not None
        assert email.uuid is not None

    def test_str(self, db):
        email = EmailFactory(subject="Hello")
        assert "Hello" in str(email)

    def test_default_folder_is_inbox(self, db):
        email = EmailFactory()
        assert email.folder == "inbox"

    def test_ordering_by_created_at_desc(self, db):
        account = AccountFactory()
        EmailFactory(account=account, subject="First")
        e2 = EmailFactory(account=account, subject="Second")
        emails = list(Email.objects.filter(account=account))
        assert emails[0] == e2  # Most recent first


class TestRecipientModel:
    def test_create(self, db):
        r = RecipientFactory()
        assert r.pk is not None

    def test_str(self, db):
        r = RecipientFactory(address="a@b.com", kind="TO")
        assert str(r) == "a@b.com (TO)"

    def test_unique_constraint(self, db):
        r = RecipientFactory()
        with pytest.raises(IntegrityError):
            Recipient.objects.create(
                email=r.email,
                address=r.address,
                kind=r.kind,
                order=1,
            )


class TestAttachmentModel:
    def test_create(self, db):
        att = AttachmentFactory()
        assert att.pk is not None

    def test_str(self, db):
        att = AttachmentFactory(name="report.pdf")
        assert str(att) == "report.pdf"


class TestFilterRuleModel:
    def test_create(self, db):
        f = FilterRuleFactory()
        assert f.pk is not None

    def test_str(self, db):
        f = FilterRuleFactory(name="Auto-archive")
        assert str(f) == "Auto-archive"


class TestLabelModel:
    def test_create(self, db):
        label = LabelFactory()
        assert label.pk is not None

    def test_str(self, db):
        label = LabelFactory(name="Important")
        assert str(label) == "Important"

    def test_unique_user_name(self, db):
        label = LabelFactory()
        with pytest.raises(IntegrityError):
            Label.objects.create(user=label.user, name=label.name)


class TestCustomFolderModel:
    def test_create(self, db):
        folder = CustomFolderFactory()
        assert folder.pk is not None

    def test_str(self, db):
        folder = CustomFolderFactory(name="Projects")
        assert str(folder) == "Projects"

    def test_unique_user_name_parent(self, db):
        parent = CustomFolderFactory(name="Parent")
        CustomFolder.objects.create(user=parent.user, name="Child", parent=parent)
        with pytest.raises(IntegrityError):
            CustomFolder.objects.create(
                user=parent.user,
                name="Child",
                parent=parent,
            )


class TestContactModel:
    def test_create(self, db):
        contact = ContactFactory()
        assert contact.pk is not None

    def test_str(self, db):
        contact = ContactFactory(name="Alice", email="alice@example.com")
        assert str(contact) == "Alice <alice@example.com>"


class TestContactGroupModel:
    def test_create(self, db):
        group = ContactGroupFactory()
        assert group.pk is not None

    def test_str(self, db):
        group = ContactGroupFactory(name="Friends")
        assert str(group) == "Friends"

    def test_unique_user_name(self, db):
        group = ContactGroupFactory()
        with pytest.raises(IntegrityError):
            ContactGroup.objects.create(user=group.user, name=group.name)


class TestUserSettingsModel:
    def test_create(self, db):
        settings = UserSettingsFactory()
        assert settings.pk is not None

    def test_str(self, db):
        settings = UserSettingsFactory()
        assert "Settings for" in str(settings)

    def test_json_field_defaults(self, db):
        settings = UserSettingsFactory()
        assert settings.appearance == {}
        assert settings.notifications == {}
        assert settings.inbox_behavior == {}


class TestSignatureModel:
    def test_create(self, db):
        sig = SignatureFactory()
        assert sig.pk is not None

    def test_str(self, db):
        sig = SignatureFactory(name="Work")
        assert str(sig) == "Work"


class TestBlockedAddressModel:
    def test_create(self, db):
        ba = BlockedAddressFactory()
        assert ba.pk is not None

    def test_str(self, db):
        ba = BlockedAddressFactory(email="spam@evil.com")
        assert str(ba) == "spam@evil.com"

    def test_unique_user_email(self, db):
        ba = BlockedAddressFactory()
        with pytest.raises(IntegrityError):
            BlockedAddress.objects.create(user=ba.user, email=ba.email)


class TestKeyboardShortcutModel:
    def test_create(self, db):
        ks = KeyboardShortcutFactory()
        assert ks.pk is not None

    def test_str(self, db):
        ks = KeyboardShortcutFactory(action="compose", key="c")
        assert str(ks) == "compose: c"

    def test_unique_user_action(self, db):
        ks = KeyboardShortcutFactory()
        with pytest.raises(IntegrityError):
            KeyboardShortcut.objects.create(user=ks.user, action=ks.action, key="x")


class TestCascadeDeletes:
    def test_user_delete_cascades_to_account(self, db):
        account = AccountFactory()
        user = account.user
        user.delete()
        assert not Account.objects.filter(pk=account.pk).exists()

    def test_account_delete_cascades_to_email(self, db):
        email = EmailFactory()
        account = email.account
        account.delete()
        assert not Email.objects.filter(pk=email.pk).exists()

    def test_email_delete_cascades_to_recipient(self, db):
        recipient = RecipientFactory()
        email = recipient.email
        email.delete()
        assert not Recipient.objects.filter(pk=recipient.pk).exists()

    def test_reply_to_set_null(self, db):
        account = AccountFactory()
        original = EmailFactory(account=account)
        reply = EmailFactory(account=account, reply_to=original)
        original.delete()
        reply.refresh_from_db()
        assert reply.reply_to is None


class TestEmailLabelM2M:
    def test_delete_label_does_not_cascade_to_email(self, db):
        label = LabelFactory()
        email = EmailFactory(account=AccountFactory(user=label.user))
        email.labels.add(label)
        label.delete()
        assert Email.objects.filter(pk=email.pk).exists()
        assert email.labels.count() == 0


class TestCustomFolderCascade:
    def test_parent_delete_cascades_to_children(self, db):
        parent = CustomFolderFactory()
        child = CustomFolder.objects.create(user=parent.user, name="Child", parent=parent)
        child_pk = child.pk
        parent.delete()
        assert not CustomFolder.objects.filter(pk=child_pk).exists()


class TestAccountCascadeComprehensive:
    def test_account_delete_cascades_to_attachments(self, db):
        att = AttachmentFactory()
        account = att.email.account
        att_pk = att.pk
        account.delete()
        from penguin_mail.models import Attachment

        assert not Attachment.objects.filter(pk=att_pk).exists()

    def test_account_delete_cascades_to_recipients(self, db):
        r = RecipientFactory()
        account = r.email.account
        r_pk = r.pk
        account.delete()
        assert not Recipient.objects.filter(pk=r_pk).exists()


class TestEmailForwardedFromSetNull:
    def test_forwarded_from_set_null(self, db):
        account = AccountFactory()
        original = EmailFactory(account=account)
        forwarded = EmailFactory(account=account, forwarded_from=original)
        original.delete()
        forwarded.refresh_from_db()
        assert forwarded.forwarded_from is None


class TestUserSettingsOneToOne:
    def test_duplicate_user_settings_raises(self, db):
        settings = UserSettingsFactory()
        with pytest.raises(IntegrityError):
            from penguin_mail.models import UserSettings

            UserSettings.objects.create(user=settings.user)
