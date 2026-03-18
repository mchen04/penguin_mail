from .settings import *  # noqa: F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "/tmp/e2e_test.sqlite3",  # noqa: S108
    }
}

# Disable SMTP sending in E2E tests (no mail server available)
SMTP_SEND_ENABLED = False

# Disable IMAP background sync in E2E tests (no IMAP server available)
IMAP_SYNC_ENABLED = False
