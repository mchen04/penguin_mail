import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


# ---------------------------------------------------------------------------
# User (extends Django's AbstractUser for full auth support)
# ---------------------------------------------------------------------------

class User(AbstractUser):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)

    def __str__(self):
        return self.username


# ---------------------------------------------------------------------------
# Account (connected email account — replaces old UserEmail)
# ---------------------------------------------------------------------------

class AccountColor(models.TextChoices):
    BLUE = 'blue'
    GREEN = 'green'
    PURPLE = 'purple'
    ORANGE = 'orange'
    PINK = 'pink'
    TEAL = 'teal'
    RED = 'red'
    INDIGO = 'indigo'


class AccountProvider(models.TextChoices):
    GMAIL = 'gmail'
    OUTLOOK = 'outlook'
    CUSTOM = 'custom'


class Account(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    email = models.EmailField(max_length=254)
    name = models.CharField(max_length=150)
    color = models.CharField(max_length=10, choices=AccountColor.choices, default=AccountColor.BLUE)
    display_name = models.CharField(max_length=255, blank=True, default='')
    signature = models.TextField(blank=True, default='')
    default_signature_id = models.CharField(max_length=36, blank=True, default='')
    avatar = models.URLField(blank=True, default='')
    is_default = models.BooleanField(default=False)
    provider = models.CharField(max_length=10, choices=AccountProvider.choices, default=AccountProvider.GMAIL)
    oauth_token = models.TextField(blank=True, default='')
    last_sync_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'email'], name='unique_user_email_account'),
        ]

    def __str__(self):
        return f"{self.email} ({self.name})"


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------

class FolderType(models.TextChoices):
    INBOX = 'inbox'
    DRAFTS = 'drafts'
    SENT = 'sent'
    SPAM = 'spam'
    TRASH = 'trash'
    ARCHIVE = 'archive'
    STARRED = 'starred'
    SNOOZED = 'snoozed'
    SCHEDULED = 'scheduled'


class Email(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='emails')
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    subject = models.CharField(max_length=255, blank=True, default='')
    body = models.TextField(blank=True, default='')
    preview = models.CharField(max_length=300, blank=True, default='')
    sender_name = models.CharField(max_length=255, blank=True, default='')
    sender_email = models.EmailField(max_length=254)
    is_read = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    is_draft = models.BooleanField(default=False)
    has_attachment = models.BooleanField(default=False)
    folder = models.CharField(max_length=20, choices=FolderType.choices, default=FolderType.INBOX, db_index=True)
    thread_id = models.UUIDField(null=True, blank=True, db_index=True)
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    forwarded_from = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='forwards')
    scheduled_send_at = models.DateTimeField(null=True, blank=True)
    snooze_until = models.DateTimeField(null=True, blank=True)
    snoozed_from_folder = models.CharField(max_length=20, choices=FolderType.choices, null=True, blank=True)
    labels = models.ManyToManyField('Label', blank=True, related_name='emails')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['account', 'folder', '-created_at']),
            models.Index(fields=['account', 'is_read']),
        ]

    def __str__(self):
        return f"{self.subject} ({self.uuid})"


# ---------------------------------------------------------------------------
# Recipient (normalized — no JSON duplication on Email)
# ---------------------------------------------------------------------------

class RecipientKind(models.TextChoices):
    TO = 'TO'
    CC = 'CC'
    BCC = 'BCC'


class Recipient(models.Model):
    email = models.ForeignKey(Email, on_delete=models.CASCADE, related_name='recipients')
    address = models.EmailField(max_length=254)
    name = models.CharField(max_length=255, blank=True, default='')
    kind = models.CharField(max_length=3, choices=RecipientKind.choices)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['email', 'address', 'kind'], name='unique_recipient_per_email'),
        ]

    def __str__(self):
        return f"{self.address} ({self.kind})"


# ---------------------------------------------------------------------------
# Attachment
# ---------------------------------------------------------------------------

class Attachment(models.Model):
    email = models.ForeignKey(Email, on_delete=models.CASCADE, related_name='attachments')
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    size = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=255)
    file = models.FileField(upload_to='attachments/%Y/%m/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Label
# ---------------------------------------------------------------------------

class Label(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='labels')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=30, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_label_per_user'),
        ]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# CustomFolder
# ---------------------------------------------------------------------------

class CustomFolder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='custom_folders')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=30, blank=True, default='')
    icon = models.CharField(max_length=50, blank=True, default='')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name', 'parent'], name='unique_folder_per_user_parent'),
        ]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Contact & ContactGroup
# ---------------------------------------------------------------------------

class Contact(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=50, blank=True, default='')
    company = models.CharField(max_length=255, blank=True, default='')
    avatar = models.URLField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"


class ContactGroup(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contact_groups')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=30, blank=True, default='')
    contacts = models.ManyToManyField(Contact, blank=True, related_name='groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_contact_group_per_user'),
        ]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# UserSettings (one-to-one with User, JSON fields for flexible settings)
# ---------------------------------------------------------------------------

class UserSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settings')
    appearance = models.JSONField(default=dict, blank=True)
    notifications = models.JSONField(default=dict, blank=True)
    inbox_behavior = models.JSONField(default=dict, blank=True)
    language = models.JSONField(default=dict, blank=True)
    vacation_responder = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'User settings'

    def __str__(self):
        return f"Settings for {self.user}"


# ---------------------------------------------------------------------------
# Signature
# ---------------------------------------------------------------------------

class Signature(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='signatures')
    name = models.CharField(max_length=100)
    content = models.TextField(blank=True, default='')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# FilterRule
# ---------------------------------------------------------------------------

class FilterRule(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='filter_rules')
    name = models.CharField(max_length=100)
    enabled = models.BooleanField(default=True)
    conditions = models.JSONField(default=list)
    match_all = models.BooleanField(default=True)
    actions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# BlockedAddress
# ---------------------------------------------------------------------------

class BlockedAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blocked_addresses')
    email = models.EmailField(max_length=254)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Blocked addresses'
        constraints = [
            models.UniqueConstraint(fields=['user', 'email'], name='unique_blocked_address_per_user'),
        ]

    def __str__(self):
        return self.email


# ---------------------------------------------------------------------------
# KeyboardShortcut
# ---------------------------------------------------------------------------

class KeyboardShortcut(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='keyboard_shortcuts')
    action = models.CharField(max_length=100)
    key = models.CharField(max_length=20)
    modifiers = models.JSONField(default=list, blank=True)
    enabled = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'action'], name='unique_shortcut_per_user_action'),
        ]

    def __str__(self):
        return f"{self.action}: {self.key}"
