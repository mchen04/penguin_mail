from datetime import datetime
from typing import Optional

from ninja import Schema


class SignatureOut(Schema):
    id: str
    name: str
    content: str
    isDefault: bool


class FilterConditionOut(Schema):
    field: str
    operator: str
    value: str


class FilterActionOut(Schema):
    type: str
    value: Optional[str] = None


class FilterRuleOut(Schema):
    id: str
    name: str
    enabled: bool
    conditions: list[FilterConditionOut]
    matchAll: bool
    actions: list[FilterActionOut]
    createdAt: datetime
    updatedAt: datetime


class BlockedAddressOut(Schema):
    id: str
    email: str
    createdAt: datetime


class KeyboardShortcutOut(Schema):
    id: str
    action: str
    key: str
    modifiers: list[str]
    enabled: bool


class VacationResponderOut(Schema):
    enabled: bool = False
    subject: str = ""
    message: str = ""
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    sendToContacts: bool = True
    sendToEveryone: bool = False


class AppearanceOut(Schema):
    theme: str = "light"
    density: str = "default"
    fontSize: str = "medium"


class NotificationsOut(Schema):
    emailNotifications: bool = True
    desktopNotifications: bool = False
    soundEnabled: bool = True
    notifyOnNewEmail: bool = True
    notifyOnMention: bool = True


class InboxBehaviorOut(Schema):
    defaultReplyBehavior: str = "reply"
    sendBehavior: str = "immediately"
    conversationView: bool = True
    readingPanePosition: str = "right"
    autoAdvance: str = "next"
    markAsReadDelay: int = 0


class LanguageOut(Schema):
    language: str = "en"
    timezone: str = "UTC"
    dateFormat: str = "MM/DD/YYYY"
    timeFormat: str = "12h"


class SettingsOut(Schema):
    appearance: AppearanceOut
    notifications: NotificationsOut
    inboxBehavior: InboxBehaviorOut
    language: LanguageOut
    signatures: list[SignatureOut]
    vacationResponder: VacationResponderOut
    keyboardShortcuts: list[KeyboardShortcutOut]
    filters: list[FilterRuleOut]
    blockedAddresses: list[BlockedAddressOut]

    @staticmethod
    def from_user(user) -> "SettingsOut":
        from penguin_mail.models import UserSettings

        us, _ = UserSettings.objects.get_or_create(user=user)

        signatures = [
            SignatureOut(id=str(s.pk), name=s.name, content=s.content, isDefault=s.is_default)
            for s in user.signatures.all()
        ]

        filters = [
            FilterRuleOut(
                id=str(f.pk),
                name=f.name,
                enabled=f.enabled,
                conditions=[FilterConditionOut(**c) for c in (f.conditions or [])],
                matchAll=f.match_all,
                actions=[FilterActionOut(**a) for a in (f.actions or [])],
                createdAt=f.created_at,
                updatedAt=f.updated_at,
            )
            for f in user.filter_rules.all()
        ]

        blocked = [
            BlockedAddressOut(id=str(b.pk), email=b.email, createdAt=b.created_at)
            for b in user.blocked_addresses.all()
        ]

        shortcuts = [
            KeyboardShortcutOut(
                id=str(k.pk), action=k.action, key=k.key,
                modifiers=k.modifiers or [], enabled=k.enabled,
            )
            for k in user.keyboard_shortcuts.all()
        ]

        appearance_data = us.appearance or {}
        notifications_data = us.notifications or {}
        inbox_data = us.inbox_behavior or {}
        language_data = us.language or {}
        vacation_data = us.vacation_responder or {}

        return SettingsOut(
            appearance=AppearanceOut(**{k: v for k, v in appearance_data.items() if k in AppearanceOut.model_fields}),
            notifications=NotificationsOut(**{k: v for k, v in notifications_data.items() if k in NotificationsOut.model_fields}),
            inboxBehavior=InboxBehaviorOut(**{k: v for k, v in inbox_data.items() if k in InboxBehaviorOut.model_fields}),
            language=LanguageOut(**{k: v for k, v in language_data.items() if k in LanguageOut.model_fields}),
            signatures=signatures,
            vacationResponder=VacationResponderOut(**{k: v for k, v in vacation_data.items() if k in VacationResponderOut.model_fields}),
            keyboardShortcuts=shortcuts,
            filters=filters,
            blockedAddresses=blocked,
        )


class SettingsUpdateIn(Schema):
    appearance: Optional[dict] = None
    notifications: Optional[dict] = None
    inboxBehavior: Optional[dict] = None
    language: Optional[dict] = None
    vacationResponder: Optional[dict] = None


class SignatureCreateIn(Schema):
    name: str
    content: str = ""
    isDefault: bool = False


class SignatureUpdateIn(Schema):
    name: Optional[str] = None
    content: Optional[str] = None
    isDefault: Optional[bool] = None


class FilterCreateIn(Schema):
    name: str
    enabled: bool = True
    conditions: list[dict] = []
    matchAll: bool = True
    actions: list[dict] = []


class FilterUpdateIn(Schema):
    name: Optional[str] = None
    enabled: Optional[bool] = None
    conditions: Optional[list[dict]] = None
    matchAll: Optional[bool] = None
    actions: Optional[list[dict]] = None


class BlockAddressIn(Schema):
    email: str
