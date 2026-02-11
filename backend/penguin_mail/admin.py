from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from . import models


@admin.register(models.User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    readonly_fields = ('uuid',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('API', {'fields': ('uuid',)}),
    )


@admin.register(models.Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'user', 'provider', 'color', 'is_default')
    list_filter = ('provider', 'color', 'is_default')
    search_fields = ('email', 'name', 'user__username')


class RecipientInline(admin.TabularInline):
    model = models.Recipient
    extra = 0


class AttachmentInline(admin.TabularInline):
    model = models.Attachment
    extra = 0


@admin.register(models.Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('subject', 'sender_email', 'folder', 'is_read', 'is_starred', 'is_draft', 'created_at')
    list_filter = ('folder', 'is_read', 'is_starred', 'is_draft', 'has_attachment')
    search_fields = ('subject', 'sender_email', 'body')
    readonly_fields = ('uuid',)
    inlines = [RecipientInline, AttachmentInline]


@admin.register(models.Recipient)
class RecipientAdmin(admin.ModelAdmin):
    list_display = ('address', 'name', 'kind', 'email')
    list_filter = ('kind',)
    search_fields = ('address', 'name')


@admin.register(models.Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'mime_type', 'size', 'email', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('uuid',)


@admin.register(models.Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'user')
    search_fields = ('name',)


@admin.register(models.CustomFolder)
class CustomFolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'user', 'parent', 'order')
    list_filter = ('user',)
    search_fields = ('name',)


@admin.register(models.Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'is_favorite', 'user')
    list_filter = ('is_favorite',)
    search_fields = ('name', 'email', 'company')


@admin.register(models.ContactGroup)
class ContactGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'user')
    search_fields = ('name',)


@admin.register(models.UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'updated_at')


@admin.register(models.Signature)
class SignatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_default')
    list_filter = ('is_default',)
    search_fields = ('name',)


@admin.register(models.FilterRule)
class FilterRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'enabled', 'match_all')
    list_filter = ('enabled', 'match_all')
    search_fields = ('name',)


@admin.register(models.BlockedAddress)
class BlockedAddressAdmin(admin.ModelAdmin):
    list_display = ('email', 'user', 'created_at')
    search_fields = ('email',)


@admin.register(models.KeyboardShortcut)
class KeyboardShortcutAdmin(admin.ModelAdmin):
    list_display = ('action', 'key', 'user', 'enabled')
    list_filter = ('enabled',)
    search_fields = ('action',)
