"""Shared type definitions for API views."""

from typing import Any

from django.http import HttpRequest


class AuthenticatedRequest(HttpRequest):
    """HttpRequest subclass carrying the django-ninja auth principal.

    django-ninja injects `auth` at runtime when a router uses JWTAuth();
    declaring it here lets mypy track accesses to `request.auth` without
    requiring `# type: ignore` at every call site.
    """

    auth: Any
