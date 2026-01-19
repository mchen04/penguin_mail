# Backend API Contract

This document describes the expected backend API contract for the Penguin Mail email client. The current implementation uses mock repositories with localStorage persistence. Switching to a real backend requires implementing these endpoints.

## Architecture Overview

The application uses a **Repository Pattern** for data access:

```
Component → Context → Repository Interface → Mock/Real Implementation
```

Repository interfaces are defined in `src/repositories/types.ts`. To switch to a real backend:
1. Create new repository implementations that call your API
2. Update `src/repositories/index.ts` to use the new implementations
3. Update `createMockRepositories()` to `createRepositories()` with your implementations

## Base URL

All endpoints should be prefixed with your API base URL:
```
const API_BASE = process.env.VITE_API_URL || 'https://api.example.com/v1'
```

---

## Authentication

### Headers
All authenticated requests should include:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Endpoints

#### POST /auth/login
Login and receive tokens.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

#### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "expiresIn": 3600
}
```

#### POST /auth/logout
Invalidate tokens.

---

## Email Endpoints

### GET /emails
Fetch emails with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| folder | string | Filter by folder (inbox, sent, drafts, trash, spam, archive) |
| accountId | string | Filter by account ID |
| isRead | boolean | Filter by read status |
| isStarred | boolean | Filter by starred status |
| hasAttachment | boolean | Filter by attachment presence |
| search | string | Full-text search in subject, from, body |
| from | string | Filter by sender email/name |
| to | string | Filter by recipient email/name |
| subject | string | Filter by subject content |
| labelIds | string[] | Filter by label IDs |
| threadId | string | Get emails in a thread |
| dateRange | string | Date filter: any, today, week, month, year, custom |
| dateFrom | ISO 8601 date | Custom date range start (with dateRange=custom) |
| dateTo | ISO 8601 date | Custom date range end (with dateRange=custom) |
| page | number | Page number (1-indexed) |
| pageSize | number | Items per page (default: 50) |
| sortField | string | Sort field (date, from, subject) |
| sortDirection | string | Sort direction (asc, desc) |

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "accountId": "string",
      "accountColor": "blue|green|purple|orange|pink|teal|red|indigo",
      "threadId": "string|null",
      "from": {
        "name": "string",
        "email": "string"
      },
      "to": [{ "name": "string", "email": "string" }],
      "cc": [{ "name": "string", "email": "string" }],
      "bcc": [{ "name": "string", "email": "string" }],
      "subject": "string",
      "preview": "string",
      "body": "string",
      "date": "ISO 8601 datetime",
      "isRead": "boolean",
      "isStarred": "boolean",
      "isDraft": "boolean",
      "folder": "inbox|sent|drafts|trash|spam|archive",
      "labels": ["string"],
      "attachments": [
        {
          "id": "string",
          "name": "string",
          "size": "number",
          "mimeType": "string",
          "url": "string"
        }
      ],
      "replyToId": "string|null",
      "forwardedFromId": "string|null"
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

### GET /emails/:id
Fetch single email by ID.

### POST /emails
Create and send a new email.

**Request:**
```json
{
  "accountId": "string",
  "to": [{ "name": "string", "email": "string" }],
  "cc": [{ "name": "string", "email": "string" }],
  "bcc": [{ "name": "string", "email": "string" }],
  "subject": "string",
  "body": "string",
  "replyToId": "string|null",
  "forwardedFromId": "string|null",
  "attachments": ["file IDs"]
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created email object */ }
}
```

### POST /emails/draft
Save email as draft.

**Request:** Same as POST /emails

### PATCH /emails/:id
Update email properties.

**Request:**
```json
{
  "isRead": "boolean",
  "isStarred": "boolean",
  "folder": "string",
  "labels": ["string"]
}
```

### DELETE /emails/:id
Move email to trash (soft delete).

### DELETE /emails/:id/permanent
Permanently delete email.

### POST /emails/bulk
Bulk operations on multiple emails.

**Request:**
```json
{
  "ids": ["string"],
  "operation": "markRead|markUnread|star|unstar|archive|delete|deletePermanent|move|addLabel|removeLabel",
  "folder": "string (for move operation)",
  "labelId": "string (for label operations)"
}
```

### POST /emails/:id/labels
Add labels to an email.

**Request:**
```json
{
  "labelIds": ["string"]
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated email object */ }
}
```

### DELETE /emails/:id/labels
Remove labels from an email.

**Request:**
```json
{
  "labelIds": ["string"]
}
```

---

## Account Endpoints

### GET /accounts
Fetch user's email accounts.

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "color": "blue|green|purple|orange|pink|teal|red|indigo",
      "isActive": "boolean",
      "signature": "string|null",
      "provider": "gmail|outlook|custom",
      "lastSyncAt": "ISO 8601 datetime"
    }
  ]
}
```

### POST /accounts
Add new email account.

### PATCH /accounts/:id
Update account settings.

### DELETE /accounts/:id
Remove email account.

---

## Contact Endpoints

### GET /contacts
Fetch contacts with pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name, email, company |
| groupId | string | Filter by contact group |
| isFavorite | boolean | Filter favorites |
| page | number | Page number |
| pageSize | number | Items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string|null",
      "company": "string|null",
      "avatar": "string|null",
      "notes": "string|null",
      "isFavorite": "boolean",
      "groups": ["groupId"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "pagination": { /* ... */ }
}
```

### POST /contacts
Create contact.

### PATCH /contacts/:id
Update contact.

### DELETE /contacts/:id
Delete contact.

### POST /contacts/:id/favorite
Toggle favorite status.

---

## Contact Groups Endpoints

### GET /contact-groups
Fetch all contact groups.

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "color": "string (hex)",
      "contactIds": ["string"],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

### POST /contact-groups
Create group.

### PATCH /contact-groups/:id
Update group.

### DELETE /contact-groups/:id
Delete group.

---

## Folder Endpoints

### GET /folders
Fetch custom folders.

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "color": "string (hex)",
      "icon": "string|null",
      "parentId": "string|null",
      "order": "number",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

### POST /folders
Create custom folder.

### PATCH /folders/:id
Update folder.

### DELETE /folders/:id
Delete folder.

---

## Label Endpoints

### GET /labels
Fetch all labels.

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "color": "string (hex)",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

### POST /labels
Create label.

### PATCH /labels/:id
Update label.

### DELETE /labels/:id
Delete label.

---

## Settings Endpoints

### GET /settings
Fetch user settings.

**Response:**
```json
{
  "appearance": {
    "theme": "light|dark|system",
    "density": "compact|default|comfortable",
    "fontSize": "small|medium|large"
  },
  "notifications": {
    "emailNotifications": "boolean",
    "desktopNotifications": "boolean",
    "soundEnabled": "boolean",
    "notifyOnNewEmail": "boolean",
    "notifyOnMention": "boolean"
  },
  "inboxBehavior": {
    "defaultReplyBehavior": "reply|replyAll",
    "sendBehavior": "immediately|delay30s|delay60s",
    "conversationView": "boolean",
    "readingPanePosition": "right|bottom|hidden",
    "autoAdvance": "next|previous|list",
    "markAsReadDelay": "number (ms)"
  },
  "language": {
    "language": "string (locale)",
    "timezone": "string",
    "dateFormat": "MM/DD/YYYY|DD/MM/YYYY|YYYY-MM-DD",
    "timeFormat": "12h|24h"
  },
  "signatures": [
    {
      "id": "string",
      "name": "string",
      "content": "string (HTML)",
      "isDefault": "boolean"
    }
  ],
  "vacationResponder": {
    "enabled": "boolean",
    "subject": "string",
    "message": "string",
    "startDate": "ISO 8601 date|null",
    "endDate": "ISO 8601 date|null",
    "sendToContacts": "boolean",
    "sendToEveryone": "boolean"
  },
  "keyboardShortcuts": [
    {
      "id": "string",
      "action": "string",
      "key": "string",
      "modifiers": ["ctrl"|"alt"|"shift"|"meta"],
      "enabled": "boolean"
    }
  ],
  "filters": [
    {
      "id": "string",
      "name": "string",
      "enabled": "boolean",
      "conditions": [
        {
          "field": "from|to|subject|body|hasAttachment",
          "operator": "contains|equals|startsWith|endsWith|notContains",
          "value": "string"
        }
      ],
      "matchAll": "boolean",
      "actions": [
        {
          "type": "moveTo|addLabel|markAsRead|markAsStarred|delete|archive",
          "value": "string|null"
        }
      ],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "blockedAddresses": [
    {
      "id": "string",
      "email": "string",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

### PATCH /settings
Update settings (partial update supported).

### POST /settings/reset
Reset settings to defaults.

---

## File Upload Endpoints

### POST /attachments/upload
Upload file attachment.

**Request:** multipart/form-data
- file: Binary file data

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "size": "number",
  "mimeType": "string",
  "url": "string"
}
```

### GET /attachments/:id
Download attachment.

---

## WebSocket Events (Real-time Updates)

For real-time sync, implement WebSocket connections.

### Connection

```
ws://api.example.com/ws?token=<access_token>
```

The WebSocket connection requires authentication via the access token passed as a query parameter.

### Events from Server

#### `email:new`
Triggered when a new email is received.

```json
{
  "event": "email:new",
  "data": {
    "email": { /* full email object */ },
    "accountId": "string"
  }
}
```

#### `email:updated`
Triggered when an email is updated (read status, labels, folder, etc.).

```json
{
  "event": "email:updated",
  "data": {
    "emailId": "string",
    "updates": {
      "isRead": "boolean|undefined",
      "isStarred": "boolean|undefined",
      "folder": "string|undefined",
      "labels": "string[]|undefined"
    }
  }
}
```

#### `email:deleted`
Triggered when an email is permanently deleted.

```json
{
  "event": "email:deleted",
  "data": {
    "emailId": "string"
  }
}
```

#### `sync:complete`
Triggered when initial sync or resync is complete.

```json
{
  "event": "sync:complete",
  "data": {
    "accountId": "string",
    "timestamp": "ISO 8601 datetime"
  }
}
```

#### `connection:error`
Triggered when a connection error occurs.

```json
{
  "event": "connection:error",
  "data": {
    "code": "string",
    "message": "string"
  }
}
```

### Events from Client

#### `subscribe:account`
Subscribe to updates for a specific account.

```json
{
  "event": "subscribe:account",
  "data": {
    "accountId": "string"
  }
}
```

#### `unsubscribe:account`
Unsubscribe from account updates.

```json
{
  "event": "unsubscribe:account",
  "data": {
    "accountId": "string"
  }
}
```

#### `ping`
Keep-alive ping (server responds with `pong`).

```json
{
  "event": "ping"
}
```

### Connection Lifecycle

1. **Connect**: Client connects with access token
2. **Subscribe**: Client subscribes to relevant accounts
3. **Receive**: Server pushes real-time updates
4. **Reconnect**: On disconnect, client should reconnect with exponential backoff
5. **Resubscribe**: After reconnect, client should resubscribe to accounts

### Reconnection Strategy

```typescript
const reconnect = (attempt: number) => {
  const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
  setTimeout(() => connect(), delay)
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

---

## Implementation Notes

### Switching to Real Backend

1. **Create API Client:**
```typescript
// src/services/api.ts
const api = {
  get: (url: string) => fetch(`${API_BASE}${url}`, { headers: authHeaders() }),
  post: (url: string, body: any) => fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  }),
  // ... patch, delete
}
```

2. **Create Real Repository:**
```typescript
// src/repositories/ApiEmailRepository.ts
export class ApiEmailRepository implements IEmailRepository {
  async search(filters, pagination) {
    const params = new URLSearchParams(/* ... */)
    const response = await api.get(`/emails?${params}`)
    return response.json()
  }
  // ... implement all methods
}
```

3. **Update Repository Factory:**
```typescript
// src/repositories/index.ts
export function createRepositories(): Repositories {
  return {
    emails: new ApiEmailRepository(),
    accounts: new ApiAccountRepository(),
    // ...
  }
}
```

4. **Environment Variables:**
```env
VITE_API_URL=https://api.yourbackend.com/v1
VITE_WS_URL=wss://api.yourbackend.com/ws
```

### Data Synchronization

The current mock implementation uses optimistic updates:
1. Update local state immediately
2. Persist to storage asynchronously

For real backend:
1. Update local state optimistically
2. Send API request
3. On failure, revert local state and show error toast

### Offline Support

Consider implementing:
1. Service Worker for caching
2. IndexedDB for offline email storage
3. Queue for pending operations
4. Sync on reconnection
