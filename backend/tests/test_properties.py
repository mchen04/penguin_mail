"""Property-based tests using Hypothesis.

These tests use Hypothesis to generate systematic edge cases that the AI
implementation likely didn't anticipate, particularly around _strip_html (Bug B2)
and pagination invariants.
"""

import json
import re

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from penguin_mail.api.routers.emails import _strip_html

# ---------------------------------------------------------------------------
# TestStripHtmlProperties — Bug B2: regex <[^>]+> fails on multi-line attrs
# ---------------------------------------------------------------------------


class TestStripHtmlProperties:
    """Properties that must hold for _strip_html regardless of input."""

    @settings(suppress_health_check=[HealthCheck.too_slow], max_examples=50)
    @given(st.text(max_size=500))
    def test_output_contains_no_html_tags(self, html_input):
        """After stripping, the result must not contain any <tag> patterns."""
        result = _strip_html(html_input)
        # Any remaining < ... > sequence is a bug
        remaining_tags = re.findall(r"<[^>]+>", result)
        assert remaining_tags == [], (
            f"_strip_html left tags {remaining_tags!r} in output for input {html_input!r}. "
            "Bug B2: regex fails on some inputs."
        )

    @settings(suppress_health_check=[HealthCheck.too_slow], max_examples=50)
    @given(st.text(max_size=2000))
    def test_output_never_exceeds_preview_length(self, html_input):
        """Output length must never exceed max_length (default 200)."""
        result = _strip_html(html_input)
        assert len(result) <= 200, f"_strip_html produced {len(result)} chars, expected <= 200."

    @settings(suppress_health_check=[HealthCheck.too_slow], max_examples=50)
    @given(st.text(alphabet=st.characters(whitelist_categories=("Lu", "Ll", "Nd", "Zs")), max_size=100))
    def test_plain_text_round_trips(self, plain_text):
        """Plain text with no HTML should pass through (modulo whitespace normalisation)."""
        result = _strip_html(plain_text)
        # The stripped version should be a prefix/subset of the normalised input.
        normalised = re.sub(r"\s+", " ", plain_text).strip()
        assert result == normalised[:200], f"Plain text was altered by _strip_html: {plain_text!r} → {result!r}"

    @settings(suppress_health_check=[HealthCheck.too_slow], max_examples=30)
    @given(
        # Construct CDATA sections that contain a > character, which terminates the
        # regex <[^>]+> early and leaves residual content in the output.
        st.builds(
            lambda body: f"<![CDATA[{body}]]>",
            body=st.text(
                alphabet=st.characters(whitelist_categories=("Ll", "Nd")),
                min_size=1,
                max_size=30,
            ).map(lambda s: s + ">"),  # always include a > to trigger Bug B2
        )
    )
    def test_cdata_sections_stripped(self, html_input):
        """CDATA sections containing '>' must be fully stripped — documents Bug B2."""
        result = _strip_html(html_input)
        # Bug B2: <[^>]+> stops at the first > inside CDATA, leaving ']]>' in output.
        assert (
            "]]>" not in result and ">" not in result
        ), f"CDATA residue found in output: {result!r}. Bug B2: regex stops at first > inside CDATA."


# ---------------------------------------------------------------------------
# TestEmailRoundTrip — pagination and email round-trip invariants
# ---------------------------------------------------------------------------


class TestEmailRoundTrip:
    """Round-trip and pagination invariants via the API."""

    @pytest.mark.django_db
    @settings(
        suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
        max_examples=20,
        deadline=None,
    )
    @given(
        subject=st.text(
            alphabet=st.characters(whitelist_categories=("Lu", "Ll", "Nd", "Zs", "Po")),
            min_size=1,
            max_size=200,
        )
    )
    def test_created_email_subject_round_trips(self, authed_client, account, subject):
        """A subject POSTed to the API must survive the round-trip unchanged."""
        payload = {
            "accountId": str(account.uuid),
            "to": [{"name": "R", "email": "r@example.com"}],
            "subject": subject,
            "body": "body",
        }
        create_resp = authed_client.post("/api/v1/emails/", data=json.dumps(payload))
        assert create_resp.status_code == 201
        created_id = create_resp.json()["id"]

        get_resp = authed_client.get(f"/api/v1/emails/{created_id}")
        assert get_resp.status_code == 200
        assert (
            get_resp.json()["subject"] == subject
        ), f"Subject did not round-trip: sent {subject!r}, got {get_resp.json()['subject']!r}"

    @pytest.mark.django_db
    @settings(
        suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
        max_examples=10,
        deadline=None,
    )
    @given(page_size=st.integers(min_value=1, max_value=20))
    def test_pagination_page_data_never_exceeds_page_size(self, authed_client, account, page_size):
        """Each page of results must contain at most page_size items."""
        from factories import EmailFactory

        # Ensure there is at least page_size+1 email in the account
        for _ in range(page_size + 1):
            EmailFactory(account=account, folder="inbox")

        resp = authed_client.get(f"/api/v1/emails/?folder=inbox&page=1&pageSize={page_size}")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) <= page_size, f"Page returned {len(data['data'])} items but pageSize={page_size}."

    @pytest.mark.django_db
    @settings(
        suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
        max_examples=5,
        deadline=None,
    )
    @given(n=st.integers(min_value=1, max_value=15))
    def test_sum_of_all_pages_equals_total(self, authed_client, account, n):
        """Paginating through all pages must yield exactly N emails."""
        from factories import EmailFactory

        for _ in range(n):
            EmailFactory(account=account, folder="inbox")

        page_size = 5
        page = 1
        collected = 0
        total_reported = None

        while True:
            resp = authed_client.get(f"/api/v1/emails/?folder=inbox&page={page}&pageSize={page_size}")
            assert resp.status_code == 200
            body = resp.json()
            if total_reported is None:
                total_reported = body["total"]
            items = body["data"]
            collected += len(items)
            if len(items) < page_size:
                break
            page += 1
            if page > 100:
                break  # safety guard

        assert (
            collected == total_reported
        ), f"Collected {collected} items across pages but 'total' reported {total_reported}."


# ---------------------------------------------------------------------------
# TestReadToggleProperties — read/unread toggle invariants
# ---------------------------------------------------------------------------


class TestReadToggleProperties:
    """Properties of the isRead toggle endpoint."""

    @pytest.mark.django_db
    @settings(
        suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
        max_examples=20,
    )
    @given(initial_read=st.booleans())
    def test_mark_read_flips_flag_exactly_once(self, authed_client, account, initial_read):
        """PATCH isRead=True then PATCH isRead=False must return to initial=False state."""
        from factories import EmailFactory

        email = EmailFactory(account=account, is_read=initial_read)

        # Flip to read
        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"isRead": True}),
        )
        assert resp.status_code == 200
        assert resp.json()["isRead"] is True

        # Flip back to unread
        resp2 = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"isRead": False}),
        )
        assert resp2.status_code == 200
        assert resp2.json()["isRead"] is False

    @pytest.mark.django_db
    @settings(
        suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
        max_examples=20,
    )
    @given(st.just(True))  # always start read
    def test_mark_read_on_already_read_is_noop(self, authed_client, account, _):
        """PATCHing isRead=True on an already-read email must leave it read."""
        from factories import EmailFactory

        email = EmailFactory(account=account, is_read=True)

        resp = authed_client.patch(
            f"/api/v1/emails/{email.uuid}",
            data=json.dumps({"isRead": True}),
        )
        assert resp.status_code == 200
        assert resp.json()["isRead"] is True, "Double-marking read must be idempotent."
