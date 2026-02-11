# Penguin Mail Backend

Django REST API backend for Penguin Mail, built with [Django Ninja](https://django-ninja.dev/).

## Setup

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment (optional)

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

If no `.env` is provided, Django will use the defaults in `settings.py`.

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Create a user

```bash
python manage.py createsuperuser
```

You'll use these credentials to log in from the frontend.

### 6. Start the server

```bash
python manage.py runserver
```

The server starts at `http://localhost:8000`.

## API

All API endpoints are under `/api/v1/`. The API uses JWT Bearer token authentication.

### Interactive docs

Visit `http://localhost:8000/api/v1/docs` for the auto-generated Swagger UI where you can explore and test all endpoints.

### Routers

| Router | Prefix | Description |
|--------|--------|-------------|
| auth | `/auth` | Login, refresh token, logout |
| emails | `/emails` | Email CRUD, search, bulk operations |
| accounts | `/accounts` | Email account management |
| contacts | `/contacts` | Contact management |
| contact-groups | `/contact-groups` | Contact group management |
| folders | `/folders` | Custom folder management |
| labels | `/labels` | Label management |
| settings | `/settings` | User settings (appearance, notifications, etc.) |
| attachments | `/attachments` | File upload and download |

### Authentication flow

1. `POST /api/v1/auth/login` with `{ email, password }` — returns `access_token` (15 min) and `refresh_token` (7 days)
2. Include `Authorization: Bearer <access_token>` on all subsequent requests
3. When access token expires, `POST /api/v1/auth/refresh` with `{ refresh_token }` to get a new one

## Data Models

The backend has 14 models defined in `penguin_mail/models.py`:

- **User** — extends Django's `AbstractUser` with a UUID field
- **Account** — connected email accounts (Gmail, Outlook, custom)
- **Email** — emails with full metadata, threading, and folder assignment
- **Recipient** — normalized TO/CC/BCC recipients per email
- **Attachment** — file attachments with upload staging support
- **Label** — user-defined color-coded labels
- **CustomFolder** — user-defined folders with nesting and ordering
- **Contact** — contacts with name, email, phone, company, favorites
- **ContactGroup** — contact groups with color coding
- **UserSettings** — user preferences stored as JSON fields
- **Signature** — email signatures (HTML content, default selection)
- **FilterRule** — email filter rules with conditions and actions
- **BlockedAddress** — blocked email addresses
- **KeyboardShortcut** — customizable keyboard shortcuts

## Common Commands

```bash
# Run development server
python manage.py runserver

# Apply migrations
python manage.py migrate

# Create new migrations after model changes
python manage.py makemigrations

# Create a superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell

# Check for issues
python manage.py check

# Collect static files (for production)
python manage.py collectstatic
```
