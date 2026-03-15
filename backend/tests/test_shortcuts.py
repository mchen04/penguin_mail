"""Tests for API shortcuts."""

import pytest
from ninja.errors import HttpError

from factories import AttachmentFactory, LabelFactory
from penguin_mail.api.shortcuts import get_object_or_404
from penguin_mail.models import Attachment, Label


class TestGetObjectOr404:
    def test_with_user(self, user):
        label = LabelFactory(user=user)
        result = get_object_or_404(Label, user=user, uuid=label.uuid)
        assert result == label

    def test_with_user_not_found(self, user):
        import uuid

        with pytest.raises(HttpError):
            get_object_or_404(Label, user=user, uuid=uuid.uuid4())

    def test_without_user(self, db):
        att = AttachmentFactory()
        result = get_object_or_404(Attachment, uuid=att.uuid)
        assert result == att

    def test_without_user_not_found(self, db):
        import uuid

        with pytest.raises(HttpError):
            get_object_or_404(Attachment, uuid=uuid.uuid4())
