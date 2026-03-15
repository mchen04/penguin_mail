import uuid

import factory
from django.contrib.auth.hashers import make_password

from penguin_mail.models import (
    Account,
    Attachment,
    BlockedAddress,
    Contact,
    ContactGroup,
    CustomFolder,
    Email,
    FilterRule,
    KeyboardShortcut,
    Label,
    Recipient,
    Signature,
    User,
    UserSettings,
)


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda o: f"{o.username}@example.com")
    password = factory.LazyFunction(lambda: make_password("testpass123"))
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")


class AccountFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Account

    user = factory.SubFactory(UserFactory)
    email = factory.LazyAttribute(lambda o: f"{o.user.username}@mail.example.com")
    name = factory.LazyAttribute(lambda o: o.user.first_name)
    color = "blue"
    is_default = True


class LabelFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Label

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Label {n}")
    color = "red"


class EmailFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Email

    account = factory.SubFactory(AccountFactory)
    subject = factory.Faker("sentence", nb_words=5)
    body = factory.Faker("paragraph")
    preview = factory.LazyAttribute(lambda o: o.body[:200])
    sender_name = factory.Faker("name")
    sender_email = factory.Faker("email")
    folder = "inbox"
    thread_id = factory.LazyFunction(uuid.uuid4)


class RecipientFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Recipient

    email = factory.SubFactory(EmailFactory)
    address = factory.Faker("email")
    name = factory.Faker("name")
    kind = "TO"
    order = 0


class AttachmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Attachment

    email = factory.SubFactory(EmailFactory)
    uploaded_by = None
    name = "document.pdf"
    size = 1024
    mime_type = "application/pdf"
    file = factory.django.FileField(filename="document.pdf")


class CustomFolderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomFolder

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Folder {n}")
    color = "blue"
    order = 0


class ContactFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Contact

    user = factory.SubFactory(UserFactory)
    name = factory.Faker("name")
    email = factory.Faker("email")
    phone = factory.Faker("phone_number")
    company = factory.Faker("company")


class ContactGroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ContactGroup

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Group {n}")
    color = "green"


class UserSettingsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserSettings

    user = factory.SubFactory(UserFactory)


class SignatureFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Signature

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Signature {n}")
    content = "<p>Best regards</p>"
    is_default = False


class FilterRuleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FilterRule

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Filter {n}")
    enabled = True
    conditions = factory.LazyFunction(lambda: [{"field": "from", "operator": "contains", "value": "test"}])
    match_all = True
    actions = factory.LazyFunction(lambda: [{"type": "moveTo", "value": "archive"}])


class BlockedAddressFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = BlockedAddress

    user = factory.SubFactory(UserFactory)
    email = factory.Faker("email")


class KeyboardShortcutFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = KeyboardShortcut

    user = factory.SubFactory(UserFactory)
    action = factory.Sequence(lambda n: f"action_{n}")
    key = "a"
    modifiers = factory.LazyFunction(list)
    enabled = True
