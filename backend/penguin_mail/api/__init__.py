from ninja import NinjaAPI

from .auth import JWTAuth
from .routers import (
    auth_router,
    emails_router,
    accounts_router,
    contacts_router,
    contact_groups_router,
    folders_router,
    labels_router,
    settings_router,
    attachments_router,
)

api = NinjaAPI(title="Penguin Mail API", version="1.0.0")

api.add_router("/auth", auth_router, tags=["auth"])
api.add_router("/emails", emails_router, tags=["emails"])
api.add_router("/accounts", accounts_router, tags=["accounts"])
api.add_router("/contacts", contacts_router, tags=["contacts"])
api.add_router("/contact-groups", contact_groups_router, tags=["contact-groups"])
api.add_router("/folders", folders_router, tags=["folders"])
api.add_router("/labels", labels_router, tags=["labels"])
api.add_router("/settings", settings_router, tags=["settings"])
api.add_router("/attachments", attachments_router, tags=["attachments"])
