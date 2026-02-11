# Testing Guide

This guide covers how to test Penguin Mail — both the backend API and the frontend application.

## Prerequisites

Make sure both servers are running:

```bash
# Terminal 1 — Backend (from backend/)
source venv/bin/activate
python manage.py runserver

# Terminal 2 — Frontend (from frontend/)
npm run dev
```

You need at least one user account. Create one if you haven't:

```bash
cd backend
python manage.py createsuperuser
```

---

## 1. Backend API Testing

### Using the Swagger UI

The fastest way to explore and test the API is the built-in interactive docs:

1. Open `http://localhost:8000/api/v1/docs`
2. All endpoints are listed with request/response schemas
3. Click any endpoint, fill in parameters, and click "Try it out"

**Note:** Most endpoints require authentication. You'll need to get a token first (see below).

### Using curl

#### Step 1: Get a JWT token

```bash
# Login
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_EMAIL", "password": "YOUR_PASSWORD"}' | python -m json.tool
```

Save the `access_token` from the response:

```bash
export TOKEN="paste-your-access-token-here"
```

#### Step 2: Test authenticated endpoints

```bash
# List accounts
curl -s http://localhost:8000/api/v1/accounts/ \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# Get settings
curl -s http://localhost:8000/api/v1/settings/ \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# List emails (inbox)
curl -s "http://localhost:8000/api/v1/emails/?folder=inbox" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# List contacts
curl -s http://localhost:8000/api/v1/contacts/ \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# List labels
curl -s http://localhost:8000/api/v1/labels/ \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# List folders
curl -s http://localhost:8000/api/v1/folders/ \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

### Using the Django shell

For quick data inspection or setup:

```bash
cd backend
python manage.py shell
```

```python
from penguin_mail.models import *

# Check existing users
User.objects.all()

# Check accounts for a user
user = User.objects.first()
Account.objects.filter(user=user)

# Check emails
Email.objects.filter(account__user=user).count()

# Create test data
account = Account.objects.create(
    user=user,
    email="test@example.com",
    name="Test Account",
    color="blue"
)
```

---

## 2. API Endpoint Test Checklist

Walk through each section to verify the API works end-to-end.

### Authentication

```bash
# Login — should return access_token and refresh_token
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_EMAIL", "password": "YOUR_PASSWORD"}'

# Refresh — should return new access_token
curl -s -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'

# Logout
curl -s -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Verify token is invalidated (should 401)
curl -s http://localhost:8000/api/v1/accounts/ \
  -H "Authorization: Bearer $TOKEN"
```

### Accounts

```bash
# Create an account
curl -s -X POST http://localhost:8000/api/v1/accounts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "work@example.com", "name": "Work", "color": "blue"}'

# List accounts
curl -s http://localhost:8000/api/v1/accounts/ \
  -H "Authorization: Bearer $TOKEN"

# Update account (use ID from create response)
curl -s -X PATCH http://localhost:8000/api/v1/accounts/ACCOUNT_ID/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"color": "green", "name": "Work Email"}'

# Delete account
curl -s -X DELETE http://localhost:8000/api/v1/accounts/ACCOUNT_ID/ \
  -H "Authorization: Bearer $TOKEN"
```

### Emails

```bash
# Send an email (requires an account — use account ID from above)
curl -s -X POST http://localhost:8000/api/v1/emails/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "to": [{"name": "Test", "email": "test@example.com"}],
    "cc": [],
    "bcc": [],
    "subject": "Test Email",
    "body": "<p>Hello from the API!</p>"
  }'

# Save a draft
curl -s -X POST http://localhost:8000/api/v1/emails/draft \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "to": [],
    "subject": "Draft subject",
    "body": "Work in progress..."
  }'

# List emails in inbox
curl -s "http://localhost:8000/api/v1/emails/?folder=inbox" \
  -H "Authorization: Bearer $TOKEN"

# List drafts
curl -s "http://localhost:8000/api/v1/emails/?folder=drafts" \
  -H "Authorization: Bearer $TOKEN"

# Mark as read
curl -s -X PATCH http://localhost:8000/api/v1/emails/EMAIL_ID/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isRead": true}'

# Star an email
curl -s -X PATCH http://localhost:8000/api/v1/emails/EMAIL_ID/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isStarred": true}'

# Move to trash
curl -s -X DELETE http://localhost:8000/api/v1/emails/EMAIL_ID/ \
  -H "Authorization: Bearer $TOKEN"

# Bulk mark as read
curl -s -X POST http://localhost:8000/api/v1/emails/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["EMAIL_ID_1", "EMAIL_ID_2"], "operation": "markRead"}'
```

### Contacts

```bash
# Create a contact
curl -s -X POST http://localhost:8000/api/v1/contacts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "name": "Jane Doe", "company": "Acme"}'

# Search contacts
curl -s "http://localhost:8000/api/v1/contacts/search?q=jane" \
  -H "Authorization: Bearer $TOKEN"

# Toggle favorite
curl -s -X POST http://localhost:8000/api/v1/contacts/CONTACT_ID/toggle-favorite \
  -H "Authorization: Bearer $TOKEN"
```

### Labels

```bash
# Create a label
curl -s -X POST http://localhost:8000/api/v1/labels/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Important", "color": "#ef4444"}'

# Add label to email
curl -s -X POST http://localhost:8000/api/v1/emails/EMAIL_ID/labels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"labelIds": ["LABEL_ID"]}'
```

### Settings

```bash
# Get settings
curl -s http://localhost:8000/api/v1/settings/ \
  -H "Authorization: Bearer $TOKEN"

# Update theme to dark
curl -s -X PATCH http://localhost:8000/api/v1/settings/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appearance": {"theme": "dark"}}'

# Create a signature
curl -s -X POST http://localhost:8000/api/v1/settings/signatures \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Work", "content": "<p>Best regards,<br>Your Name</p>", "isDefault": true}'

# Reset settings
curl -s -X POST http://localhost:8000/api/v1/settings/reset \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Frontend Testing

### Manual Testing Checklist

Start the frontend (`npm run dev`) and backend (`python manage.py runserver`), then walk through these flows:

#### Login Flow
- [ ] Navigate to `http://localhost:5173` — login page appears
- [ ] Enter invalid credentials — error message shown
- [ ] Enter valid credentials — redirected to inbox
- [ ] Refresh the page — still logged in (tokens persisted)
- [ ] Click logout — returned to login page

#### Accounts
- [ ] Sidebar shows user's email accounts
- [ ] Accounts expand/collapse to show folders
- [ ] Unread counts appear next to folders

#### Email List
- [ ] Inbox loads and displays emails (empty state if no emails)
- [ ] Click different folders (Sent, Drafts, Trash, etc.)
- [ ] Star/unstar emails from the list
- [ ] Select emails with checkboxes
- [ ] Bulk actions work (archive, delete, mark read/unread)

#### Compose
- [ ] Click Compose — compose window opens
- [ ] Fill in To, Subject, Body
- [ ] Send email — appears in Sent folder
- [ ] Minimize/maximize compose window
- [ ] Close compose window (discards draft or saves)
- [ ] Reply to an email — pre-fills To and Subject
- [ ] Forward an email — pre-fills Body

#### Email View
- [ ] Click an email — full view opens
- [ ] Email marked as read automatically
- [ ] Reply, Reply All, Forward buttons work
- [ ] Star/unstar from email view
- [ ] Archive/Delete from email view
- [ ] Navigate back to list

#### Search
- [ ] Type in search bar — results filter
- [ ] Advanced search filters work (from, to, subject, date range)
- [ ] Clear search returns to normal view

#### Labels
- [ ] Create a new label
- [ ] Apply label to an email
- [ ] Filter emails by label
- [ ] Edit/delete labels

#### Custom Folders
- [ ] Create a new folder
- [ ] Move emails to custom folder
- [ ] Folder appears in sidebar
- [ ] Delete folder

#### Contacts
- [ ] Open contacts panel
- [ ] Create a new contact
- [ ] Search contacts
- [ ] Edit/delete contacts
- [ ] Toggle favorite
- [ ] Contact groups — create, add/remove contacts

#### Settings
- [ ] Open settings modal
- [ ] Change theme (light/dark/system) — UI updates
- [ ] Change density — layout adjusts
- [ ] Change font size
- [ ] Date/time format options
- [ ] Notification toggles
- [ ] Create/edit/delete signatures
- [ ] Email templates — create, edit, delete
- [ ] Vacation responder — enable/disable with dates
- [ ] Email filters — create, enable/disable, delete
- [ ] Blocked addresses — add, remove
- [ ] Keyboard shortcuts — toggle on/off
- [ ] Reset all settings

### TypeScript Check

```bash
cd frontend
npx tsc --noEmit
```

Should report zero errors.

### Production Build

```bash
cd frontend
npm run build
```

Verify it builds without errors. Preview with:

```bash
npm run preview
```

### Unit Tests

```bash
cd frontend

# Watch mode
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage
```

### Linting

```bash
cd frontend
npm run lint
```

---

## 4. End-to-End Workflow Tests

These test complete user workflows across the full stack.

### Workflow 1: New User Setup

1. Create superuser via `manage.py createsuperuser`
2. Login from frontend
3. Create first email account (sidebar → Add account)
4. Verify settings load with defaults
5. Customize theme and density
6. Create a signature

### Workflow 2: Email Round-Trip

1. Login and select an account
2. Compose and send an email
3. Verify email appears in Sent folder
4. Open the sent email, click Reply
5. Send the reply
6. Verify thread view shows both emails

### Workflow 3: Organization

1. Create two labels ("Work", "Personal")
2. Create a custom folder ("Projects")
3. Send an email, apply the "Work" label
4. Move the email to "Projects" folder
5. Verify email appears in custom folder with label
6. Filter by label — email shows up
7. Remove label and delete folder

### Workflow 4: Contacts

1. Create 3 contacts
2. Create a contact group, add 2 contacts
3. Favorite one contact
4. Search for a contact by name
5. Start composing — contact autocomplete works
6. Delete a contact, verify removed from group

### Workflow 5: Settings Persistence

1. Change theme to dark
2. Change density to compact
3. Refresh the page — settings persist
4. Create a filter rule
5. Block an email address
6. Reset settings — everything returns to defaults

---

## 5. Seed Data Script

To quickly populate the database with test data, use the Django shell:

```bash
cd backend
python manage.py shell
```

```python
from penguin_mail.models import *

user = User.objects.first()

# Create accounts
work = Account.objects.create(user=user, email="work@example.com", name="Work", color="blue")
personal = Account.objects.create(user=user, email="me@example.com", name="Personal", color="green")

# Create some emails
for i in range(5):
    Email.objects.create(
        account=work,
        subject=f"Test email #{i+1}",
        body=f"<p>This is test email number {i+1}.</p>",
        preview=f"This is test email number {i+1}.",
        sender_name="Alice",
        sender_email="alice@example.com",
        folder="inbox",
    )

# Create contacts
for name, email in [("Alice", "alice@example.com"), ("Bob", "bob@example.com"), ("Carol", "carol@example.com")]:
    Contact.objects.create(user=user, name=name, email=email)

# Create labels
Label.objects.create(user=user, name="Important", color="#ef4444")
Label.objects.create(user=user, name="Work", color="#3b82f6")

print(f"Created {Email.objects.filter(account__user=user).count()} emails")
print(f"Created {Contact.objects.filter(user=user).count()} contacts")
print(f"Created {Label.objects.filter(user=user).count()} labels")
```

After running this, refresh the frontend to see the test data.

---

## 6. Troubleshooting

### "401 Unauthorized" on all requests
- Your access token may have expired (15-minute lifetime)
- Re-login to get fresh tokens
- Check that the `Authorization: Bearer <token>` header is set correctly

### Frontend shows login page after refresh
- Check browser DevTools → Application → Local Storage for `penguin_access_token`
- If missing, the token wasn't saved — check for console errors during login

### CORS errors in browser console
- Ensure `django-cors-headers` is installed and `CORS_ALLOW_ALL_ORIGINS = True` is in `settings.py`
- The backend must be running on `localhost:8000` (matches `.env.development`)

### "No module named 'ninja'" or import errors
- Activate your virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### Database errors after model changes
- Run migrations: `python manage.py makemigrations && python manage.py migrate`
- If migrations fail, you can reset the SQLite database: delete `db.sqlite3` and re-run `migrate` + `createsuperuser`

### Frontend build errors
- Run `npx tsc --noEmit` to check for TypeScript errors
- Run `npm install` to ensure dependencies are up to date
