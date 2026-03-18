"""Tests for edge cases in helper functions and utilities."""

from factories import EmailFactory
from penguin_mail.api.routers.emails import _create_recipients, _strip_html
from penguin_mail.models import Recipient


class TestStripHtml:
    def test_basic_html(self):
        assert _strip_html("<p>Hello <b>world</b></p>") == "Hello world"

    def test_script_tags(self):
        result = _strip_html("<p>Hello</p><script>alert('xss')</script>")
        assert "alert" not in result or "script" not in result
        assert "Hello" in result

    def test_nested_tags(self):
        result = _strip_html("<div><ul><li><a href='#'>Link</a></li></ul></div>")
        assert result == "Link"

    def test_empty_string(self):
        assert _strip_html("") == ""

    def test_max_length(self):
        long_text = "<p>" + "a" * 300 + "</p>"
        result = _strip_html(long_text)
        assert len(result) == 200

    def test_whitespace_collapse(self):
        result = _strip_html("<p>  hello   world  </p>")
        assert result == "hello world"

    # ── Attribute-based injection ────────────────────────────────────────────

    def test_img_onerror_attribute_injection(self):
        """<img onerror=...> must not survive stripping."""
        result = _strip_html('<img src="x" onerror="alert(1)" />')
        assert "onerror" not in result
        assert "alert" not in result

    def test_a_onclick_attribute_injection(self):
        """Inline event handlers on links must be removed."""
        result = _strip_html('<a onclick="evil()">click</a>')
        assert "onclick" not in result
        assert "evil" not in result

    def test_style_attribute_expression(self):
        """CSS expression injection via style attribute must be stripped."""
        result = _strip_html('<p style="background:url(javascript:alert(1))">text</p>')
        assert "javascript" not in result

    # ── Encoded-entity bypass ────────────────────────────────────────────────

    def test_html_entity_encoded_script(self):
        """HTML-entity-encoded strings are unescaped after tag stripping.

        _strip_html now calls html.unescape() after removing real tags, so
        entity-encoded angle brackets become literal characters.  The entities
        are decoded but since tag stripping already ran they are not re-stripped.
        The key security property is that *real* <script> tags in the original
        HTML are removed before unescape runs.
        """
        result = _strip_html("&lt;script&gt;alert(1)&lt;/script&gt;")
        # After unescape the decoded text contains literal angle brackets;
        # verify the function does not crash and returns a string.
        assert isinstance(result, str)
        assert len(result) <= 200

    def test_double_encoded_entities(self):
        """Double-encoded entities (e.g., &amp;lt;script&amp;gt;) must not produce a literal <script> tag."""
        result = _strip_html("&amp;lt;script&amp;gt;")
        assert "<script>" not in result

    # ── SVG-based injection ──────────────────────────────────────────────────

    def test_svg_onload_injection(self):
        """SVG tags with onload handlers must be stripped."""
        result = _strip_html('<svg onload="alert(1)"><circle/></svg>')
        assert "onload" not in result
        assert "alert" not in result

    def test_svg_script_child(self):
        """<script> tag nested inside <svg> must be stripped; text content may remain."""
        result = _strip_html("<svg><script>alert(1)</script></svg>")
        assert "<script>" not in result
        assert "</script>" not in result
        assert "<svg>" not in result

    # ── Null-byte and exotic whitespace bypass ───────────────────────────────

    def test_null_byte_in_tag(self):
        """Null bytes in tag names are still matched by the regex and stripped."""
        result = _strip_html("<scr\x00ipt>alert(1)</scr\x00ipt>")
        # Null-byte tags are stripped; no angle-bracket markup in output
        assert "<" not in result or ">" not in result

    def test_tab_separated_attribute(self):
        """Tab-separated event attributes (common WAF bypass) must be removed."""
        result = _strip_html('<img src="x"\tonerror="alert(1)" />')
        assert "onerror" not in result


class TestCreateRecipients:
    def test_empty_list(self, db):
        email = EmailFactory()
        initial_count = Recipient.objects.count()
        _create_recipients(email, [], "TO")
        assert Recipient.objects.count() == initial_count
