.PHONY: test test-backend test-frontend test-e2e lint lint-backend lint-frontend check all audit dead-code setup-hooks

# Run everything (lint + test)
all: lint test

# ─── Tests ────────────────────────────────────────────────────────────────────

test: test-backend test-frontend

test-backend:
	cd backend && venv/bin/python -m pytest tests/ -v --tb=short

test-frontend:
	cd frontend && npx vitest run

test-e2e:
	cd frontend && npx playwright test

# With coverage
test-cov: test-backend-cov test-frontend-cov

test-backend-cov:
	cd backend && venv/bin/python -m pytest tests/ -v --cov=penguin_mail --cov-report=term-missing

test-frontend-cov:
	cd frontend && npx vitest run --coverage

# ─── Linting ──────────────────────────────────────────────────────────────────

lint: lint-backend lint-frontend

lint-backend:
	cd backend && venv/bin/ruff check .
	cd backend && venv/bin/ruff format --check .

lint-frontend:
	cd frontend && npx tsc --noEmit
	cd frontend && npm run lint

# Auto-fix
lint-fix:
	cd backend && venv/bin/ruff check --fix .
	cd backend && venv/bin/ruff format .

# ─── Dead code detection ─────────────────────────────────────────────────────

dead-code:
	cd backend && venv/bin/vulture penguin_mail/ --min-confidence 80
	cd frontend && npx knip

# ─── Security audit ──────────────────────────────────────────────────────────

audit:
	cd backend && venv/bin/pip-audit
	cd frontend && npm audit --audit-level=moderate

# ─── Full CI check (mirrors GitHub Actions) ──────────────────────────────────

check: lint test
	@echo "✓ All checks passed"

# ─── Hook setup ──────────────────────────────────────────────────────────────

setup-hooks:
	pre-commit install
	pre-commit install --hook-type pre-push
