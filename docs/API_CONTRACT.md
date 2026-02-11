# Backend API Contract

This document describes the Penguin Mail REST API. The backend is built with Django Ninja and serves all endpoints under `/api/v1/`.

## Architecture

```
React Component → Context → Repository Interface → ApiRepository → Django Ninja API
```

Repository interfaces are defined in `frontend/src/repositories/types.ts`. API repository implementations live in `frontend/src/repositories/Api*.ts`. The API client (`frontend/src/services/apiClient.ts`) handles JWT token management, automatic refresh, and error handling.

## Base URL

```
VITE_API_URL=http://localhost:8000/api/v1
```

Interactive API docs (Swagger UI) are available at `/api/v1/docs`.

---

## Authentication

### Headers

All authenticated requests include:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Lifecycle

- **Access token**: 15-minute expiry, HS256 JWT
- **Refresh token**: 7-day expiry, HS256 JWT
- The frontend automatically refreshes expired access tokens via the refresh endpoint

### POST /auth/login

Login and receive tokens. **No auth required.**

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

**Error (401):** `{ "detail": "Invalid credentials" }`

### POST /auth/refresh

Refresh an expired access token. **No auth required.**

**Request:**
```json
{
  "refresh_token": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

### POST /auth/logout

Logout current user. **Auth required.**

**Response (200):** `{ "success": true }`

---

## Email Endpoints

All email endpoints require authentication.

### GET /emails

List emails with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| folder | string | — | Filter by folder (inbox, sent, drafts, trash, spam, archive, starred, snoozed, scheduled) |
| accountId | string | — | Filter by account ID |
| isRead | boolean | — | Filter by read status |
| isStarred | boolean | — | Filter by starred status |
| hasAttachment | boolean | — | Filter by attachment presence |
| search | string | — | Full-text search in subject, sender, body |
| threadId | string | — | Get all emails in a thread |
| labelIds | string | — | Comma-separated label IDs |
| page | number | 1 | Page number (1-indexed) |
| pageSize | number | 50 | Items per page (max 200) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "string",
      "accountId": "string",
      "accountColor": "blue",
      "from_": { "name": "string", "email": "string" },
      "to": [{ "name": "string", "email": "string" }],
      "cc": [],
      "bcc": [],
      "subject": "string",
      "preview": "string",
      "body": "string (HTML)",
      "date": "2025-01-15T10:30:00Z",
      "isRead": false,
      "isStarred": false,
      "hasAttachment": false,
      "attachments": [],
      "folder": "inbox",
      "labels": ["label-uuid"],
      "threadId": "string|null",
      "replyToId": "string|null",
      "forwardedFromId": "string|null",
      "isDraft": false,
      "scheduledSendAt": null,
      "snoozeUntil": null,
      "snoozedFromFolder": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### GET /emails/{id}

Get a single email by ID.

**Response (200):** Single email object (same shape as list items).

**Error (404):** `{ "detail": "Email not found" }`

### POST /emails

Create and send an email.

**Request:**
```json
{
  "accountId": "string",
  "to": [{ "name": "string", "email": "string" }],
  "cc": [],
  "bcc": [],
  "subject": "string",
  "body": "string",
  "replyToId": null,
  "forwardedFromId": null,
  "scheduledSendAt": null
}
```

**Response (201):** Created email object.

### POST /emails/draft

Save an email as a draft. Same request body as POST /emails.

**Response (201):** Created draft email object (with `isDraft: true`, `folder: "drafts"`).

### PATCH /emails/{id}

Update email properties.

**Request (all fields optional):**
```json
{
  "isRead": true,
  "isStarred": false,
  "folder": "archive",
  "labels": ["label-uuid-1", "label-uuid-2"]
}
```

**Response (200):** Updated email object.

### DELETE /emails/{id}

Move email to trash (soft delete).

**Response (200):** `{ "success": true }`

### DELETE /emails/{id}/permanent

Permanently delete an email.

**Response (200):** `{ "success": true }`

### POST /emails/bulk

Bulk operations on multiple emails.

**Request:**
```json
{
  "ids": ["email-id-1", "email-id-2"],
  "operation": "markRead|markUnread|star|unstar|archive|delete|deletePermanent|move|addLabel|removeLabel",
  "folder": "string (required for 'move' operation)",
  "labelIds": ["string (for addLabel/removeLabel operations)"]
}
```

**Response (200):** `{ "success": true }`

### POST /emails/{id}/labels

Add labels to an email.

**Request:**
```json
{
  "labelIds": ["label-uuid-1"]
}
```

**Response (200):** `{ "success": true }`

### DELETE /emails/{id}/labels

Remove labels from an email. Same request body as add.

**Response (200):** `{ "success": true }`

---

## Account Endpoints

All account endpoints require authentication.

### GET /accounts

List all accounts for the current user.

**Response (200):**
```json
[
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "color": "blue",
    "displayName": "",
    "signature": "",
    "defaultSignatureId": "",
    "avatar": "",
    "isDefault": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
]
```

### GET /accounts/{id}

Get a single account.

### POST /accounts

Create a new email account.

**Request:**
```json
{
  "email": "string",
  "name": "string",
  "color": "blue",
  "displayName": "",
  "signature": ""
}
```

**Response (201):** Created account object.

### PATCH /accounts/{id}

Update account settings. All fields optional.

**Request:**
```json
{
  "name": "string",
  "color": "green",
  "displayName": "string",
  "signature": "string",
  "defaultSignatureId": "string",
  "avatar": "string",
  "isDefault": true
}
```

### DELETE /accounts/{id}

Delete an account.

**Response (200):** `{ "success": true }`

### POST /accounts/{id}/set-default

Set an account as the default.

**Response (200):** `{ "success": true }`

---

## Contact Endpoints

All contact endpoints require authentication.

### GET /contacts

List contacts with pagination.

**Query Parameters:** `page` (default 1), `pageSize` (default 50)

**Response (200):** `{ "data": [ContactOut], "pagination": {...} }`

### GET /contacts/search

Search contacts by name, email, or company.

**Query Parameters:** `q` (search query), `page`, `pageSize`

### GET /contacts/favorites

Get all favorite contacts.

**Response (200):** `[ContactOut]`

### GET /contacts/by-group/{group_id}

Get contacts belonging to a specific group.

### GET /contacts/{id}

Get a single contact.

**Contact object:**
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "avatar": "",
  "phone": "",
  "company": "",
  "notes": "",
  "isFavorite": false,
  "groups": ["group-uuid"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### GET /contacts/by-email/{email}

Look up a contact by email address.

### POST /contacts

Create a contact.

**Request:**
```json
{
  "email": "string",
  "name": "string",
  "avatar": "",
  "phone": "",
  "company": "",
  "notes": "",
  "groups": []
}
```

### PATCH /contacts/{id}

Update a contact. All fields optional.

### DELETE /contacts/{id}

Delete a contact.

### POST /contacts/{id}/toggle-favorite

Toggle the favorite status of a contact.

### POST /contacts/{id}/add-to-group/{group_id}

Add a contact to a group.

### POST /contacts/{id}/remove-from-group/{group_id}

Remove a contact from a group.

---

## Contact Group Endpoints

### GET /contact-groups

List all contact groups.

**Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "color": "",
    "contactIds": ["contact-uuid"],
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
]
```

### POST /contact-groups

**Request:** `{ "name": "string", "color": "" }`

### PATCH /contact-groups/{id}

**Request:** `{ "name": "string", "color": "string" }` (all optional)

### DELETE /contact-groups/{id}

---

## Folder Endpoints

### GET /folders

List custom folders for the current user.

**Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "color": "",
    "parentId": null,
    "order": 0,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
]
```

### POST /folders

**Request:** `{ "name": "string", "color": "", "parentId": null }`

### PATCH /folders/{id}

**Request:** `{ "name": "string", "color": "string" }` (all optional)

### DELETE /folders/{id}

### POST /folders/{id}/reorder

Reorder a folder. **Query parameter:** `newOrder` (default 0).

---

## Label Endpoints

### GET /labels

List all labels.

**Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "color": ""
  }
]
```

### POST /labels

**Request:** `{ "name": "string", "color": "" }`

### PATCH /labels/{id}

**Request:** `{ "name": "string", "color": "string" }` (all optional)

### DELETE /labels/{id}

---

## Settings Endpoints

### GET /settings

Fetch all user settings. Creates default settings on first access.

**Response (200):**
```json
{
  "appearance": {
    "theme": "system",
    "density": "default",
    "fontSize": "medium"
  },
  "notifications": {
    "emailNotifications": true,
    "desktopNotifications": false,
    "soundEnabled": true,
    "notifyOnNewEmail": true,
    "notifyOnMention": true
  },
  "inboxBehavior": {
    "defaultReplyBehavior": "reply",
    "sendBehavior": "immediately",
    "conversationView": true,
    "readingPanePosition": "right",
    "autoAdvance": "next",
    "markAsReadDelay": 0
  },
  "language": {
    "language": "en",
    "timezone": "UTC",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h"
  },
  "signatures": [],
  "vacationResponder": {
    "enabled": false,
    "subject": "",
    "message": "",
    "startDate": null,
    "endDate": null,
    "sendToContacts": false,
    "sendToEveryone": true
  },
  "keyboardShortcuts": [],
  "filters": [],
  "blockedAddresses": []
}
```

### PATCH /settings

Update settings (partial update). Only send the fields you want to change.

**Request:**
```json
{
  "appearance": { "theme": "dark" },
  "notifications": { "soundEnabled": false }
}
```

### POST /settings/reset

Reset all settings to defaults.

### POST /settings/signatures

Create a signature. **Request:** `{ "name": "string", "content": "", "isDefault": false }`

### PATCH /settings/signatures/{id}

Update a signature. All fields optional.

### DELETE /settings/signatures/{id}

### POST /settings/filters

Create a filter rule.

**Request:**
```json
{
  "name": "string",
  "enabled": true,
  "conditions": [{ "field": "from", "operator": "contains", "value": "string" }],
  "matchAll": true,
  "actions": [{ "type": "moveTo", "value": "folder-name" }]
}
```

### PATCH /settings/filters/{id}

### DELETE /settings/filters/{id}

### POST /settings/blocked-addresses

Block an email address. **Request:** `{ "email": "string" }`

### DELETE /settings/blocked-addresses/{email}

Unblock an email address.

### PATCH /settings/keyboard-shortcuts/{id}

Update a keyboard shortcut. **Query params:** `enabled`, `key`, `modifiers`.

---

## Attachment Endpoints

### POST /attachments/upload

Upload a file attachment. Uses `multipart/form-data`.

**Request:** Form field `file` with the binary file data.

**Response (201):**
```json
{
  "id": "string",
  "name": "original-filename.pdf",
  "size": 12345,
  "mimeType": "application/pdf",
  "url": "/media/attachments/2025/01/file.pdf"
}
```

### GET /attachments/{id}

Get attachment metadata.

### GET /attachments/{id}/download

Download the attachment file (returns binary file response).

---

## Error Responses

Errors return a JSON object with a `detail` field:

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthorized (invalid/expired token) |
| 404 | Resource not found |
| 422 | Validation error (bad request body) |
| 500 | Internal server error |

## Pagination

Paginated endpoints return:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

Maximum page size is 200. Default is 50.
