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
    subject = models.CharField(max_length=255, db_column='Subject')
    message = models.TextField(db_column='Message')
    sender = models.EmailField(max_length=254, db_column='From')
    to = models.JSONField(blank=True, db_column='To')
    cc = models.JSONField(blank=True, db_column='CC')
    bcc = models.JSONField(blank=True, db_column='BCC')
    timestamp = models.DateTimeField(auto_now_add=True, db_column='Timestamp')
#   embedded email content (e.g., HTML) can be added as needed # Figure this out

    class Meta:
        db_table = 'Emails'

    def __str__(self):
        return str(self.email_id)

# Not sure if we need Receipients table if we are storing To, CC, BCC as JSON in Emails table. 
# But if we want to keep track of individual recipients for querying purposes, we can use this model.
class Recipient(models.Model):
    email = models.ForeignKey(Email, on_delete=models.CASCADE, related_name='recipients')
    address = models.EmailField(max_length=254)
    kind = models.CharField(max_length=3, choices=[('TO','TO'),('CC','CC'),('BCC','BCC')])
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'Recipients'
        unique_together = ('email', 'address', 'kind')

    def __str__(self):
        return f"{self.address} ({self.kind}) for email {self.email.email_id}"


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

