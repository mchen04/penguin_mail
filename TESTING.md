# Testing

Three layers: backend (pytest/Django), frontend (vitest/jsdom), E2E (Playwright). CI runs all three on every push.

| Layer | Location | Runner | Coverage |
|-------|----------|--------|----------|
| Backend | `backend/tests/` (21 files) | pytest + pytest-django | 85% enforced (actual: ~100%) |
| Frontend | `frontend/src/**/*.test.{ts,tsx}` (63 files) | vitest + jsdom | lines 67%, functions 52%, branches 52% |
| E2E | `frontend/e2e/` (11 suites) | Playwright | — |

## Commands

```bash
make test              # backend + frontend
make test-backend      # backend only
make test-frontend     # frontend only
make test-e2e          # E2E only
make test-cov          # all with coverage
make check             # lint + test (mirrors CI)
```

## Philosophy: guarding against AI-code false confidence

This suite was specifically hardened to catch failure modes common in AI-generated code:

- **Typed mock returns** — mocks used to return partial objects missing 15+ fields, causing tests to pass against types the real API would never produce. All mocks in `mock-repositories.ts` now return fully-typed objects.
- **Real query counts** — `django_assert_num_queries` pins exact DB hit counts so silently-added ORM joins don't slip through.
- **Adversarial inputs** (`test_hostile.py`) — SQL injection patterns, oversized payloads, malformed data; things a generator produces structurally valid code for but doesn't stress-test.
- **Property-based tests** — Hypothesis (backend) and fast-check (frontend) generate thousands of random inputs to find invariant violations automatically.
- **Seeded E2E state** — `seed.ts` creates and cleans up test data via the API; tests no longer assume pre-existing DB state that only exists locally.
- **Accessibility checks** — axe-core assertions on key UI components catch structural markup issues.
- **Workflow integration tests** (`test_workflows.py`) — full request-chain tests (compose→sent, star→archive, label→search, draft lifecycle) that unit tests can't catch.

## Backend (pytest)

**[pytest](https://docs.pytest.org)** — Python test runner. **pytest-django** adds Django DB access, settings management, and the `Client` fixture.

**[factory_boy](https://factoryboy.readthedocs.io)** (`factories.py`) — declarative model factories; builds ORM instances with realistic defaults and minimal boilerplate.

**[Hypothesis](https://hypothesis.works)** (`test_properties.py`) — property-based testing library that generates random inputs and shrinks failures to minimal examples.

**`django_assert_num_queries`** — Django test utility that asserts exactly N SQL queries were executed; used to pin and prevent N+1 regressions.

**Fixtures** (`conftest.py`): `user`, `second_user`, `account`, `second_account`, `auth_headers`/`second_auth_headers` (JWT Bearer), `authed_client` (Django `Client` with headers pre-applied), `_use_tmp_media` (autouse, isolates uploads).

Config: `backend/pytest.ini` — `--strict-markers`, coverage omits `asgi.py`/`wsgi.py`.

## Frontend (vitest)

**[vitest](https://vitest.dev)** — Vite-native unit test runner with a Jest-compatible API. Runs in Node with `jsdom` simulating a browser DOM.

**[Testing Library](https://testing-library.com)** — renders components and queries them by accessible roles/text, discouraging implementation-detail assertions.

**[vitest-axe](https://github.com/chaance/vitest-axe)** — wraps [axe-core](https://github.com/dequelabs/axe-core) (automated accessibility engine) as a vitest matcher (`toHaveNoViolations()`).

**[fast-check](https://fast-check.dev)** — property-based testing for JavaScript; generates random inputs and shrinks failures, same idea as Hypothesis.

**`src/test/test-utils.tsx`** — `customRender()` wraps the full provider stack. `createWrapper(repos?)` for hook tests. Always import from here — never define provider wrappers locally.

**`src/test/mock-repositories.ts`** — `vi.fn()` mock repos that return fully-typed objects; inject via providers to isolate from real API calls.

**`src/test/factories.ts`** — `makeEmail()`, `makeContact()`, `makeAccount()` with typed defaults and overrides.

`clearMocks: true` in vitest config — mocks reset between every test.

## E2E (Playwright)

**[Playwright](https://playwright.dev)** — browser automation framework from Microsoft. Drives real Chromium/Firefox instances; handles async navigation, network interception, and cross-browser testing.

Local: Chromium + Firefox. CI: Chromium only (2 retries).

**`fixtures.ts`** — extends Playwright's `test` with `loggedInPage`, which authenticates via the API before each test.

**`seed.ts`** — `seedInboxEmails()` / `cleanupSeededEmails()` call the Django REST API directly to set up and tear down test data. Backend URL: `PLAYWRIGHT_API_URL` (default `http://localhost:8000`).

**Page Objects** — e.g. `ComposePage` wraps selectors and actions, keeping test code readable and resilient to markup changes.

E2E needs the Django backend running: `cd backend && venv/bin/python manage.py runserver 8000`. Playwright auto-starts the Vite dev server.

## CI (.github/workflows/test.yml)

**[ruff](https://docs.astral.sh/ruff)** — fast Python linter and formatter (replaces flake8 + black).
**[vulture](https://github.com/jendrikseipp/vulture)** — detects unused Python code.
**tsc** — TypeScript compiler run with `--noEmit` for type checking only.

| Job | Does |
|-----|------|
| `backend-lint` | ruff check + format + vulture |
| `backend-test` | pytest `--cov-fail-under=85` |
| `frontend-lint` | tsc + ESLint |
| `frontend-test` | vitest with coverage thresholds |
| `e2e` | migrate + seed admin, Django :8000 + Vite :5173, Playwright Chromium |

E2E credentials via `PLAYWRIGHT_USER_EMAIL` / `PLAYWRIGHT_USER_PASSWORD`.
