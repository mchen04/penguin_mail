from django.contrib import admin
from . import models


@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('uid', 'userName')


@admin.register(models.Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('email_id', 'sender')


@admin.register(models.UserEmail)
class UserEmailAdmin(admin.ModelAdmin):
    list_display = ('id', 'UserEmails', 'UID', 'EmailID')

