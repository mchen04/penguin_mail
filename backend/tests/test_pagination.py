"""Tests for pagination utility."""

from factories import LabelFactory
from penguin_mail.api.pagination import MAX_PAGE_SIZE, paginate_queryset
from penguin_mail.models import Label


class TestPaginateQueryset:
    def test_empty_queryset(self, db):
        qs = Label.objects.none()
        result = paginate_queryset(qs)
        assert result["items"] == []
        assert result["pagination"]["total"] == 0
        assert result["pagination"]["totalPages"] == 1

    def test_basic_pagination(self, user):
        for i in range(10):
            LabelFactory(user=user, name=f"L{i}")
        qs = Label.objects.filter(user=user)
        result = paginate_queryset(qs, page=1, page_size=3)
        assert len(result["items"]) == 3
        assert result["pagination"]["total"] == 10
        assert result["pagination"]["totalPages"] == 4
        assert result["pagination"]["page"] == 1
        assert result["pagination"]["pageSize"] == 3

    def test_last_page(self, user):
        for i in range(5):
            LabelFactory(user=user, name=f"L{i}")
        qs = Label.objects.filter(user=user)
        result = paginate_queryset(qs, page=2, page_size=3)
        assert len(result["items"]) == 2

    def test_page_clamped_to_min_1(self, user):
        LabelFactory(user=user)
        qs = Label.objects.filter(user=user)
        result = paginate_queryset(qs, page=-5, page_size=10)
        assert result["pagination"]["page"] == 1

    def test_page_size_clamped_to_max(self, user):
        LabelFactory(user=user)
        qs = Label.objects.filter(user=user)
        result = paginate_queryset(qs, page=1, page_size=999)
        assert result["pagination"]["pageSize"] == MAX_PAGE_SIZE

    def test_page_size_clamped_to_min_1(self, user):
        LabelFactory(user=user)
        qs = Label.objects.filter(user=user)
        result = paginate_queryset(qs, page=1, page_size=0)
        assert result["pagination"]["pageSize"] == 1
