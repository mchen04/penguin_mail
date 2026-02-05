from django.contrib import admin
from .models import Users, UserEmail


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = ('UserID', 'UserName')


@admin.register(UserEmail)
class UserEmailAdmin(admin.ModelAdmin):
    list_display = ('id', 'userEmails', 'UID', 'EmailID', 'created_at')
    readonly_fields = ('created_at',)
