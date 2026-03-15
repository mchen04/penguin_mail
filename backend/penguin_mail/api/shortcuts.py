"""Reusable shortcuts for API views."""

from ninja.errors import HttpError


def get_object_or_404(model, user=None, **kwargs):
    """
    Look up an object by kwargs, optionally scoped to a user.
    Raises HttpError(404) if not found.
    """
    try:
        if user is not None:
            return model.objects.get(user=user, **kwargs)
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        raise HttpError(404, "Not found")
