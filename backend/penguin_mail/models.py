import uuid
from django.db import models


class User(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='UID')
    userName = models.CharField(max_length=150, db_column='userName')

    class Meta:
        db_table = 'Users'

    def __str__(self):
        return self.userName


class Email(models.Model):
    email_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_column='EmailID')
    message = models.TextField(db_column='Message')
    sender = models.EmailField(max_length=254, db_column='From')
    to = models.TextField(blank=True, db_column='To')
    cc = models.TextField(blank=True, db_column='CC')
    bcc = models.TextField(blank=True, db_column='BCC')

    class Meta:
        db_table = 'Emails'

    def __str__(self):
        return str(self.email_id)


class UserEmail(models.Model):
    # Foreign key to Users (UID)
    UID = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UID', related_name='user_emails')
    UserEmails = models.EmailField(max_length=254, db_column='UserEmails')
    Password = models.CharField(max_length=255, db_column='Password')
    # Optional link to Email record
    EmailID = models.ForeignKey(Email, on_delete=models.SET_NULL, null=True, blank=True, db_column='EmailID', related_name='linked_accounts')

    class Meta:
        db_table = 'UserEmails'

    def __str__(self):
        return f"{self.UserEmails} (user={self.UID})"

