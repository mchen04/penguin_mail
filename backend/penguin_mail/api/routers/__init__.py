from .auth import router as auth_router
from .emails import router as emails_router
from .accounts import router as accounts_router
from .contacts import router as contacts_router
from .contact_groups import router as contact_groups_router
from .folders import router as folders_router
from .labels import router as labels_router
from .settings import router as settings_router
from .attachments import router as attachments_router

__all__ = [
    "auth_router",
    "emails_router",
    "accounts_router",
    "contacts_router",
    "contact_groups_router",
    "folders_router",
    "labels_router",
    "settings_router",
    "attachments_router",
]
