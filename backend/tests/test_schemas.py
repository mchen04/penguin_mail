"""Tests for API schemas — verify from_model conversions produce correct output."""

from factories import (
    AccountFactory,
    AttachmentFactory,
    ContactFactory,
    ContactGroupFactory,
    CustomFolderFactory,
    EmailFactory,
    LabelFactory,
    RecipientFactory,
)
from penguin_mail.api.schemas.account import AccountOut
from penguin_mail.api.schemas.attachment import AttachmentOut
from penguin_mail.api.schemas.contact import ContactGroupOut, ContactOut
from penguin_mail.api.schemas.email import EmailOut
from penguin_mail.api.schemas.folder import FolderOut
from penguin_mail.api.schemas.label import LabelOut
from penguin_mail.api.schemas.settings import SettingsOut


class TestEmailOutSchema:
    def test_from_model(self, db):
        email = EmailFactory()
        RecipientFactory(email=email, kind="TO")
        # Reload with relations
        from penguin_mail.models import Email

        email = (
            Email.objects.select_related("account", "reply_to", "forwarded_from")
            .prefetch_related("recipients", "attachments", "labels")
            .get(pk=email.pk)
        )
        out = EmailOut.from_model(email)
        assert out.id == str(email.uuid)
        assert out.subject == email.subject
        assert out.folder == email.folder
        assert len(out.to) >= 1

    def test_from_field_alias(self, db):
        email = EmailFactory()
        from penguin_mail.models import Email

        email = (
            Email.objects.select_related("account", "reply_to", "forwarded_from")
            .prefetch_related("recipients", "attachments", "labels")
            .get(pk=email.pk)
        )
        out = EmailOut.from_model(email)
        # The 'from_' field should be populated with sender info
        assert out.from_.email == email.sender_email


class TestAccountOutSchema:
    def test_from_model(self, db):
        account = AccountFactory()
        out = AccountOut.from_model(account)
        assert out.id == str(account.uuid)
        assert out.email == account.email
        assert out.isDefault == account.is_default


class TestContactOutSchema:
    def test_from_model(self, db):
        from penguin_mail.models import Contact

        contact = ContactFactory()
        contact = Contact.objects.prefetch_related("groups").get(pk=contact.pk)
        out = ContactOut.from_model(contact)
        assert out.id == str(contact.uuid)
        assert out.name == contact.name
        assert out.email == contact.email


class TestContactGroupOutSchema:
    def test_from_model(self, db):
        from penguin_mail.models import ContactGroup

        group = ContactGroupFactory()
        group = ContactGroup.objects.prefetch_related("contacts").get(pk=group.pk)
        out = ContactGroupOut.from_model(group)
        assert out.id == str(group.uuid)
        assert out.name == group.name


class TestFolderOutSchema:
    def test_from_model(self, db):
        from penguin_mail.models import CustomFolder

        folder = CustomFolderFactory()
        folder = CustomFolder.objects.select_related("parent").get(pk=folder.pk)
        out = FolderOut.from_model(folder)
        assert out.id == str(folder.uuid)
        assert out.name == folder.name

    def test_with_parent(self, db):
        from penguin_mail.models import CustomFolder

        parent = CustomFolderFactory()
        child = CustomFolderFactory(user=parent.user, parent=parent, name="Child")
        child = CustomFolder.objects.select_related("parent").get(pk=child.pk)
        out = FolderOut.from_model(child)
        assert out.parentId == str(parent.uuid)


class TestLabelOutSchema:
    def test_from_model(self, db):
        label = LabelFactory()
        out = LabelOut.from_model(label)
        assert out.id == str(label.uuid)
        assert out.name == label.name


class TestAttachmentOutSchema:
    def test_from_model(self, db):
        att = AttachmentFactory()
        out = AttachmentOut.from_model(att)
        assert out.id == str(att.uuid)
        assert out.name == att.name
        assert out.size == att.size


class TestSettingsOutSchema:
    def test_from_user(self, user):
        out = SettingsOut.from_user(user)
        assert out.appearance is not None
        assert out.notifications is not None
        assert isinstance(out.signatures, list)
        assert isinstance(out.filters, list)
