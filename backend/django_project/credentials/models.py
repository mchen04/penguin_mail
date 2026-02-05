from django.db import models


class Users(models.Model):
    UserID = models.BigAutoField(primary_key=True)
    UserName = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.UserName} ({self.UserID})"


class UserEmail(models.Model):
    UID = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='emails')
    userEmails = models.EmailField()
    Password = models.CharField(max_length=128)
    EmailID = models.CharField(max_length=255, blank=True, null=True)
    EmailMsg = models.TextField(blank=True, null=True)
    To = models.TextField(blank=True, null=True)
    From = models.EmailField(blank=True, null=True)
    CC = models.TextField(blank=True, null=True)
    BCC = models.TextField(blank=True, null=True)
    Msg = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.userEmails} ({self.UID_id})"
