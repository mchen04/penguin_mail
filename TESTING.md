# Testing

Three layers: backend (pytest/Django), frontend (vitest/jsdom), E2E (Playwright). CI runs all layers on every push.

| Layer | Runner | Coverage |
|-------|--------|----------|
| Backend | pytest + pytest-django | 99% enforced |
| Frontend | vitest + jsdom | lines 90%, functions 80%, branches 80%, statements 90% |
| E2E | Playwright | — |

## Commands

```bash
make test              # backend + frontend
make test-backend      # backend only
make test-frontend     # frontend only
make test-e2e          # E2E only
make test-cov          # all with coverage
make check             # lint + type check + test (mirrors CI)
```

## Philosophy: guarding against AI-code false confidence

- **Typed mock returns** — mocks used to return partial objects missing 15+ fields. All mocks now return fully-typed objects.
- **N+1 detection** — exact DB query counts are pinned per endpoint so silently-added ORM joins don't slip through.
- **Adversarial inputs** — SQL injection patterns, oversized payloads, and malformed data are tested explicitly.
- **Property-based tests** — Hypothesis (backend) and fast-check (frontend) generate thousands of random inputs to find invariant violations.
- **Seeded E2E state** — test data is created and cleaned up via the API; no assumed pre-existing DB state.
- **Accessibility checks** — axe-core assertions on key UI components catch structural markup issues.
- **Workflow integration tests** — full request-chain tests (compose→sent, star→archive, label→search, draft lifecycle) that unit tests can't catch.

## Backend tools

**pytest** — Python test runner. **pytest-django** adds Django DB access and test fixtures.

**pytest-cov** — measures code coverage and enforces the 99% threshold.

**factory-boy** — declarative model factories for creating test data with realistic defaults.

**Hypothesis** — property-based testing; generates random inputs and shrinks failures to minimal examples.

**django_assert_num_queries** — Django built-in utility that asserts exactly N SQL queries per operation; used to pin and prevent N+1 regressions.

**mypy** + **django-stubs** — static type checking for the entire backend; catches type errors before tests run.

**ruff** — fast Python linter and formatter (replaces flake8 + black).

**vulture** — detects unused Python code and dead functions.

## Frontend tools

**vitest** — Vite-native test runner with a Jest-compatible API. Runs in Node with jsdom simulating a browser DOM.

**jsdom** — headless DOM environment that lets vitest run browser-like tests without a real browser.

**Testing Library** — renders components and queries them by accessible roles and text, discouraging implementation-detail assertions.

**@testing-library/user-event** — simulates real user interactions (typing, clicking, tabbing) more accurately than raw DOM events.

**@testing-library/jest-dom** — custom matchers for asserting on DOM state (e.g. `toBeVisible`, `toBeDisabled`).

**@vitest/coverage-v8** — code coverage using Node's built-in V8 engine; enforces the coverage thresholds.

**fast-check** — property-based testing for JavaScript; same idea as Hypothesis.

**vitest-axe** + **axe-core** — automated accessibility engine surfaced as a vitest matcher (`toHaveNoViolations()`).

**ESLint** + **typescript-eslint** — JavaScript/TypeScript linting. **eslint-plugin-react-hooks** enforces hooks rules. **eslint-plugin-react-refresh** guards fast-refresh compatibility.

**TypeScript (tsc)** — type checking run with `--noEmit`; CI fails on any type error.

## E2E tools

**Playwright** — browser automation driving real Chromium and Firefox instances with async navigation, network interception, and cross-browser testing.

**Page Objects** — wrapper classes around selectors and actions that keep tests readable and resilient to markup changes.

Local runs use Chromium and Firefox. CI uses Chromium only with 2 retries.

## Security & SAST

**Semgrep** — static analysis scanning Python, Django, TypeScript, and React code for security issues and known vulnerability patterns. Runs as a dedicated CI job on every push, covering rulesets for secrets, injection, and framework-specific risks.

## CI jobs

| Job | What it does |
|-----|-------------|
| `backend-lint` | ruff (lint + format) + vulture + mypy type check |
| `backend-test` | pytest with 99% coverage enforcement |
| `frontend-lint` | tsc type check + ESLint |
| `frontend-test` | vitest with coverage thresholds |
| `semgrep` | SAST across Python, Django, TypeScript, React, and secrets rulesets |
| `e2e` | Spins up Django + Vite, seeds a test user, runs Playwright on Chromium |

E2E credentials supplied via `PLAYWRIGHT_USER_EMAIL` / `PLAYWRIGHT_USER_PASSWORD`.
