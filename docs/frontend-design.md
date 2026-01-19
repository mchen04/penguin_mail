# Frontend Design

A Gmail-style email web client with compact view, supporting multiple accounts.

## Design Principles

- **Compact** - minimal whitespace, tight spacing, more content visible
- **Dense** - Gmail compact density style throughout
- **Efficient** - no wasted space, every pixel has purpose

---

## Layout Overview

```
┌───────────────────────┬─────────────────────────────────────────────────────────┐
│ ☰  Logo               │ [ + Compose ]  [ 🔍 Search... ]  ☐ ☆  Archive  Del  ⚙️  │
├───────────────────────┼─────────────────────────────────────────────────────────┤
│                       │  ☐ ☆  ██ John Smith      Meeting tomorrow - Hey, ju... │
│ ▼ All accounts        │  ☑ ★  ██ Amazon          Your order shipped - Your...  │
│     Inbox (4)         │  ☐ ☆  ██ Mom             Dinner Sunday? - Are you f... │
│                       │  ☐ ☆  ██ GitHub          [penguin-mail] New PR - Us... │
│ ▼ charlie@knox.com    │  ☐ ☆  ██ Parah Shen      Re: Project update - Sound... │
│     Inbox (1)         │                                                         │
│     Drafts (3)        │                                                         │
│     Sent              │                                                         │
│     Spam              │                                                         │
│     Trash             │                                                         │
│                       │                                                         │
│ ▷ mark@shebridl.net   │                                                         │
│                       │                                                         │
│  + Add account        │                                                         │
│  ? Help               │                                                         │
└───────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## Sidebar

Has its own header with hamburger + logo, visually separated from main content area.

### Header

- **Hamburger menu** (☰) - toggles sidebar visibility
- **Logo** - app branding

### Content (top to bottom)

1. **All accounts section** (above individual accounts)
   - Inbox (combined unread count)
2. **Individual account sections** (collapsible with triangle ▼/▷)
   - Email address as header
   - Folders when expanded:
     - Inbox (unread count)
     - Drafts (count)
     - Sent
     - Spam
     - Trash
3. **Add account button** (+)
4. **Help button** (?)

### Collapsed State

- Sidebar fully hidden
- Hamburger menu stays visible in same position (top left of main content area)
- Click hamburger to expand sidebar

### Account Collapse Behavior

- When an account is collapsed (▷), only the email address shows
- When expanded (▼), all folders are visible

### Color Coding

- Each account has an associated color
- Default colors must look nice out of the box
- Users can customize colors and icons in settings
- In "All accounts" mailboxes, emails are color-coded by the account they belong to

---

## Toolbar (above email list)

Single unified bar containing:

- **Compose button** - opens compose popup
- **Search bar** - advanced search with Gmail-style filters (from:, to:, subject:, has:attachment, date range, etc.)
- **Select all checkbox** - selects all visible emails
- **Bulk actions** (enabled when emails selected, grayed out otherwise):
  - Archive
  - Delete
  - Mark as read/unread
  - Move to folder
- **Settings gear** (⚙️) - opens settings (right side)

---

## Email List

### Row Elements (left to right)

- **Checkbox** - for selecting emails
- **Star** - simple single star (no multiple types)
- **Color indicator** - shows account color (in All accounts view)
- **Sender name**
- **Subject line**
- **Message preview snippet**
- **Attachment icon** (if applicable)
- **Date/time**

### Interactions

- **Click row** - opens email (replaces list view)
- **Click checkbox** - selects email
- **Shift+click checkbox** - selects range
- **Click star** - toggles star
- **Hover** - shows quick action icons on right side:
  - Archive
  - Delete
  - Mark as read/unread

### Display

- Compact density - tight row height, minimal padding
- Single line per email row
- Unified inbox (no category tabs)
- Default sorting (newest first)

---

## Email View

### Opening Emails

- Opens in same view (replaces email list)
- Back button to return to list

### Thread/Conversation View

- Multiple replies grouped as one conversation (Gmail-style)
- Replies stacked together

### Actions

- **Reply** - respond to sender
- **Reply all** - respond to everyone
- **Forward** - send to someone else

---

## Compose Window

### Appearance

- Floating popup in bottom right corner
- Draggable to reposition anywhere on screen

### Controls

- **Minimize** (—) - shrinks to just title bar at bottom
- **Maximize** (□) - expands to full screen
- **Close** (✕) - closes/discards draft

### Features

- To, CC, BCC fields
- Subject line
- Rich text body
- Attachments
- Send button

### Limitations

- No pop-out to separate window
- No multiple drafts open at once

### Minimized State

```
┌─────────────────────────────┐
│ New Message        — □ ✕   │
└─────────────────────────────┘
```

### Expanded State

```
┌─────────────────────────────┐
│ New Message        — □ ✕   │
├─────────────────────────────┤
│ To:                         │
│ Subject:                    │
├─────────────────────────────┤
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ [ Send ]    📎  A  ...      │
└─────────────────────────────┘
```

---

## Settings

Accessed via gear icon in top right.

### Options

- **Account colors/icons** - customize per account
- **Display density** - compact vs comfortable
- **Signatures** - set signature per account
- **Default reply behavior** - reply vs reply all
- **Dark mode toggle**

---

## Theme

- **Light mode** - default
- **Dark mode** - toggle in settings

---

## Labels

Labels provide a way to categorize emails beyond folders.

### Features

- **Create labels** - Add new labels with custom names and colors
- **Apply labels** - Add one or more labels to any email
- **Filter by label** - View all emails with a specific label
- **Label picker** - Quick label assignment from email view

### Display

- Labels appear as colored chips in the email list
- Maximum 3 labels shown per email in list view
- Full label list visible in email detail view

---

## Custom Folders

Users can create custom folders in addition to system folders.

### Features

- **Create folders** - Add new folders with custom names and colors
- **Move emails** - Move emails to custom folders
- **Nested folders** - Support for parent-child folder hierarchy
- **Reorder** - Drag to reorder folders in sidebar

---

## Keyboard Shortcuts

Global keyboard shortcuts for power users.

### Available Shortcuts

- **c** - Compose new email
- **/** - Focus search
- **j/k** - Navigate up/down in email list
- **Enter** - Open selected email
- **e** - Archive selected
- **#** - Delete selected
- **Escape** - Close modals/compose

---

## Not Included

- Category tabs (Primary, Social, Promotions, etc.)
- Inbox sorting options (unread first, starred first, etc.)
- Snooze
- Browser notifications
- Pop-out compose to separate window
- Multiple compose drafts open simultaneously