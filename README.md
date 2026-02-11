# Penguin Mail

A full-stack Gmail-style email client built with React, TypeScript, and Django.

## Architecture

```
frontend/          React 19 + TypeScript + Vite
backend/           Django 5.1 + Django Ninja REST API
```

The frontend communicates with the backend via a REST API with JWT authentication. All data is stored in a Django-managed database (SQLite in development). The frontend uses a **Repository Pattern** — components talk to context providers, which delegate to repository interfaces backed by API calls.

## Features

- **Multi-account support** — switch between multiple email accounts with color coding
- **Email management** — read, compose, reply, forward, star, archive, and organize emails
- **Conversation view** — group related emails into threads
- **Rich text editor** — format emails with a WYSIWYG toolbar
- **Attachments** — upload, view, and download email attachments
- **Labels and folders** — organize emails with custom labels and nested folders
- **Contacts** — manage contacts and contact groups with favorites
- **Search** — advanced filtering (from, to, subject, date range, labels, attachments)
- **Saved searches** — save and reuse frequent search queries
- **Bulk actions** — select and manage multiple emails at once
- **Keyboard shortcuts** — customizable shortcuts for power users
- **Compact compose window** — Gmail-style floating, draggable, minimizable compose
- **Schedule send** — schedule emails to be sent at a later time
- **Snooze** — snooze emails to reappear in inbox at a specified time
- **Email templates** — save and reuse common email templates
- **Settings** — theme (light/dark/system), density, font size, date/time formats, signatures, vacation responder, filters, blocked addresses

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.9, Vite 7, CSS Modules |
| Backend | Django 5.1, Django Ninja 1.3 |
| Auth | JWT (PyJWT) with access/refresh tokens |
| Database | SQLite (development), any Django-supported DB for production |
| Password Hashing | Argon2 (primary) |
| Testing | Vitest, Testing Library, Playwright |

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (for login)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/v1/` with interactive docs at `http://localhost:8000/api/v1/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`. Log in with the superuser credentials you created.

### Running Both

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2 — Frontend
cd frontend && npm run dev
```

## Project Structure

```
penguin_mail/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   └── penguin_mail/
│       ├── settings.py
│       ├── urls.py
│       ├── models.py              # 14 Django models
│       └── api/
│           ├── auth.py            # JWT authentication
│           ├── pagination.py
│           ├── routers/           # 9 API routers
│           │   ├── auth.py
│           │   ├── emails.py
│           │   ├── accounts.py
│           │   ├── contacts.py
│           │   ├── contact_groups.py
│           │   ├── folders.py
│           │   ├── labels.py
│           │   ├── settings.py
│           │   └── attachments.py
│           └── schemas/           # Request/response schemas
├── frontend/
│   ├── package.json
│   ├── .env.development
│   ├── vercel.json
│   └── src/
│       ├── main.tsx               # Entry point
│       ├── App.tsx                # Auth gating + provider tree
│       ├── components/            # UI components
│       │   ├── auth/              # Login page
│       │   ├── email/             # Email list, view, compose
│       │   ├── sidebar/           # Navigation sidebar
│       │   ├── settings/          # Settings modal
│       │   ├── contacts/          # Contacts panel
│       │   └── common/            # Shared components
│       ├── context/               # React contexts (auth, settings, email, etc.)
│       ├── repositories/          # API repository implementations
│       ├── services/              # API client, storage
│       ├── hooks/                 # Custom hooks
│       ├── types/                 # TypeScript type definitions
│       ├── constants/             # App constants
│       └── styles/                # Global styles
└── docs/
    ├── API_CONTRACT.md            # Full API specification
    ├── TESTING.md                 # Testing guide
    └── frontend-design.md         # UI/UX design spec
```

## API Endpoints

All endpoints are under `/api/v1/`. Authentication uses Bearer JWT tokens.

| Route | Description |
|-------|-------------|
| `POST /auth/login` | Login, returns JWT tokens |
| `POST /auth/refresh` | Refresh access token |
| `POST /auth/logout` | Invalidate session |
| `GET/POST /emails/` | List (with filters) / Send email |
| `GET/PATCH/DELETE /emails/:id` | Read / Update / Trash email |
| `POST /emails/draft` | Save draft |
| `POST /emails/bulk` | Bulk operations |
| `GET/POST /accounts/` | List / Create accounts |
| `GET/POST /contacts/` | List / Create contacts |
| `GET/POST /contact-groups/` | List / Create groups |
| `GET/POST /folders/` | List / Create custom folders |
| `GET/POST /labels/` | List / Create labels |
| `GET/PATCH /settings/` | Get / Update settings |
| `POST /attachments/upload` | Upload attachment |

See [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for full details.

## Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |

### Backend

| Command | Description |
|---------|-------------|
| `python manage.py runserver` | Start Django dev server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py createsuperuser` | Create admin user |
| `python manage.py makemigrations` | Generate new migrations |
| `python manage.py shell` | Django interactive shell |

## Documentation

- [API Contract](docs/API_CONTRACT.md) — full endpoint specification with request/response schemas
- [Testing Guide](docs/TESTING.md) — how to test the backend API and frontend
- [Frontend Design](docs/frontend-design.md) — UI/UX design specification
