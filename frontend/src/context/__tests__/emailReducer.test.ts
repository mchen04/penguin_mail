import { describe, it, expect } from 'vitest'
import { emailReducer, type EmailState } from '../EmailContext'
import type { Email, FolderType } from '@/types/email'

const makeEmail = (overrides: Partial<Email> = {}): Email => ({
  id: 'email-1',
  accountId: 'acc-1',
  accountColor: 'blue',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  cc: [],
  bcc: [],
  subject: 'Test Subject',
  preview: 'Preview text',
  body: '<p>Body</p>',
  date: new Date('2024-01-15'),
  isRead: false,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox' as FolderType,
  labels: [],
  threadId: 'thread-1',
  isDraft: false,
  ...overrides,
})

const defaultSearchFilters = {
  text: '',
  from: '',
  to: '',
  subject: '',
  hasAttachment: null,
  isUnread: null,
  isStarred: null,
  dateRange: 'any' as const,
}

const makeState = (overrides: Partial<EmailState> = {}): EmailState => ({
  emails: [],
  currentFolder: 'inbox' as FolderType,
  currentAccountId: 'all',
  selectedEmailId: null,
  selectedIds: new Set(),
  lastSelectedId: null,
  searchQuery: '',
  searchFilters: { ...defaultSearchFilters },
  sortField: 'date',
  sortDirection: 'desc',
  isLoading: false,
  ...overrides,
})

describe('emailReducer', () => {
  describe('SET_EMAILS', () => {
    it('sets emails and clears loading', () => {
      const emails = [makeEmail()]
      const state = makeState({ isLoading: true })
      const next = emailReducer(state, { type: 'SET_EMAILS', emails })
      expect(next.emails).toEqual(emails)
      expect(next.isLoading).toBe(false)
    })
  })

  describe('SET_FOLDER', () => {
    it('changes folder and clears selection/search', () => {
      const state = makeState({
        selectedEmailId: 'e1',
        selectedIds: new Set(['e1']),
        searchQuery: 'hello',
      })
      const next = emailReducer(state, { type: 'SET_FOLDER', folder: 'sent' })
      expect(next.currentFolder).toBe('sent')
      expect(next.selectedEmailId).toBeNull()
      expect(next.selectedIds.size).toBe(0)
      expect(next.searchQuery).toBe('')
    })
  })

  describe('SET_ACCOUNT', () => {
    it('changes account and clears selection/search', () => {
      const state = makeState({ currentAccountId: 'acc-1', searchQuery: 'test' })
      const next = emailReducer(state, { type: 'SET_ACCOUNT', accountId: 'acc-2' })
      expect(next.currentAccountId).toBe('acc-2')
      expect(next.selectedEmailId).toBeNull()
      expect(next.searchQuery).toBe('')
    })
  })

  describe('SELECT_EMAIL', () => {
    it('selects email and marks it as read', () => {
      const email = makeEmail({ isRead: false })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'SELECT_EMAIL', id: 'email-1' })
      expect(next.selectedEmailId).toBe('email-1')
      expect(next.emails[0].isRead).toBe(true)
    })

    it('deselects when null', () => {
      const state = makeState({ selectedEmailId: 'email-1' })
      const next = emailReducer(state, { type: 'SELECT_EMAIL', id: null })
      expect(next.selectedEmailId).toBeNull()
    })
  })

  describe('TOGGLE_STAR', () => {
    it('toggles star on', () => {
      const email = makeEmail({ isStarred: false })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'TOGGLE_STAR', id: 'email-1' })
      expect(next.emails[0].isStarred).toBe(true)
    })

    it('toggles star off', () => {
      const email = makeEmail({ isStarred: true })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'TOGGLE_STAR', id: 'email-1' })
      expect(next.emails[0].isStarred).toBe(false)
    })
  })

  describe('MARK_READ', () => {
    it('marks specified emails as read and clears selection', () => {
      const emails = [
        makeEmail({ id: 'e1', isRead: false }),
        makeEmail({ id: 'e2', isRead: false }),
      ]
      const state = makeState({ emails, selectedIds: new Set(['e1']) })
      const next = emailReducer(state, { type: 'MARK_READ', ids: ['e1'] })
      expect(next.emails[0].isRead).toBe(true)
      expect(next.emails[1].isRead).toBe(false)
      expect(next.selectedIds.size).toBe(0)
    })
  })

  describe('MARK_UNREAD', () => {
    it('marks specified emails as unread', () => {
      const email = makeEmail({ isRead: true })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'MARK_UNREAD', ids: ['email-1'] })
      expect(next.emails[0].isRead).toBe(false)
    })
  })

  describe('DELETE', () => {
    it('moves emails to trash', () => {
      const email = makeEmail({ folder: 'inbox' })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'DELETE', ids: ['email-1'] })
      expect(next.emails[0].folder).toBe('trash')
    })

    it('clears selected email if it was deleted', () => {
      const email = makeEmail()
      const state = makeState({ emails: [email], selectedEmailId: 'email-1' })
      const next = emailReducer(state, { type: 'DELETE', ids: ['email-1'] })
      expect(next.selectedEmailId).toBeNull()
    })
  })

  describe('DELETE_PERMANENTLY', () => {
    it('removes emails from state', () => {
      const emails = [makeEmail({ id: 'e1' }), makeEmail({ id: 'e2' })]
      const state = makeState({ emails })
      const next = emailReducer(state, { type: 'DELETE_PERMANENTLY', ids: ['e1'] })
      expect(next.emails).toHaveLength(1)
      expect(next.emails[0].id).toBe('e2')
    })
  })

  describe('EMPTY_FOLDER', () => {
    it('removes all emails from the specified folder', () => {
      const emails = [
        makeEmail({ id: 'e1', folder: 'trash' }),
        makeEmail({ id: 'e2', folder: 'inbox' }),
      ]
      const state = makeState({ emails })
      const next = emailReducer(state, { type: 'EMPTY_FOLDER', folder: 'trash' })
      expect(next.emails).toHaveLength(1)
      expect(next.emails[0].id).toBe('e2')
    })
  })

  describe('ARCHIVE', () => {
    it('moves emails to archive', () => {
      const email = makeEmail({ folder: 'inbox' })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'ARCHIVE', ids: ['email-1'] })
      expect(next.emails[0].folder).toBe('archive')
    })
  })

  describe('MOVE_TO_FOLDER', () => {
    it('moves emails to specified folder', () => {
      const email = makeEmail({ folder: 'inbox' })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, {
        type: 'MOVE_TO_FOLDER',
        ids: ['email-1'],
        folder: 'spam',
      })
      expect(next.emails[0].folder).toBe('spam')
    })
  })

  describe('selection actions', () => {
    it('SET_SELECTION sets selected ids that exist in emails', () => {
      const email1 = makeEmail({ id: 'e1' })
      const email2 = makeEmail({ id: 'e2' })
      const state = makeState({ emails: [email1, email2] })
      const next = emailReducer(state, {
        type: 'SET_SELECTION',
        ids: new Set(['e1', 'e2']),
      })
      expect(next.selectedIds).toEqual(new Set(['e1', 'e2']))
    })

    it('CLEAR_SELECTION clears all', () => {
      const state = makeState({
        selectedIds: new Set(['e1']),
        lastSelectedId: 'e1',
      })
      const next = emailReducer(state, { type: 'CLEAR_SELECTION' })
      expect(next.selectedIds.size).toBe(0)
      expect(next.lastSelectedId).toBeNull()
    })

    it('TOGGLE_SELECTION adds an id', () => {
      const state = makeState()
      const next = emailReducer(state, { type: 'TOGGLE_SELECTION', id: 'e1' })
      expect(next.selectedIds.has('e1')).toBe(true)
      expect(next.lastSelectedId).toBe('e1')
    })

    it('TOGGLE_SELECTION removes an existing id', () => {
      const state = makeState({ selectedIds: new Set(['e1']), lastSelectedId: 'e1' })
      const next = emailReducer(state, { type: 'TOGGLE_SELECTION', id: 'e1' })
      expect(next.selectedIds.has('e1')).toBe(false)
    })

    it('TOGGLE_SELECTION_RANGE selects range', () => {
      const state = makeState({
        selectedIds: new Set(['e2']),
        lastSelectedId: 'e2',
      })
      const next = emailReducer(state, {
        type: 'TOGGLE_SELECTION_RANGE',
        id: 'e4',
        filteredIds: ['e1', 'e2', 'e3', 'e4', 'e5'],
      })
      expect(next.selectedIds.has('e2')).toBe(true)
      expect(next.selectedIds.has('e3')).toBe(true)
      expect(next.selectedIds.has('e4')).toBe(true)
      expect(next.selectedIds.has('e1')).toBe(false)
    })
  })

  describe('SET_SEARCH', () => {
    it('sets search query and clears selection', () => {
      const state = makeState({ selectedIds: new Set(['e1']) })
      const next = emailReducer(state, { type: 'SET_SEARCH', query: 'test' })
      expect(next.searchQuery).toBe('test')
      expect(next.selectedIds.size).toBe(0)
    })
  })

  describe('SET_SORT', () => {
    it('sets sort field and direction', () => {
      const state = makeState()
      const next = emailReducer(state, {
        type: 'SET_SORT',
        field: 'sender',
        direction: 'asc',
      })
      expect(next.sortField).toBe('sender')
      expect(next.sortDirection).toBe('asc')
    })
  })

  describe('ADD_EMAIL', () => {
    it('prepends email to list', () => {
      const existing = makeEmail({ id: 'e1' })
      const state = makeState({ emails: [existing] })
      const newEmail = makeEmail({ id: 'e2' })
      const next = emailReducer(state, { type: 'ADD_EMAIL', email: newEmail })
      expect(next.emails).toHaveLength(2)
      expect(next.emails[0].id).toBe('e2')
    })
  })

  describe('UPDATE_EMAIL', () => {
    it('updates specific email fields', () => {
      const email = makeEmail({ subject: 'Old' })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, {
        type: 'UPDATE_EMAIL',
        id: 'email-1',
        updates: { subject: 'New' },
      })
      expect(next.emails[0].subject).toBe('New')
    })
  })

  describe('SNOOZE_EMAILS', () => {
    it('moves emails to snoozed folder', () => {
      const email = makeEmail({ folder: 'inbox' })
      const state = makeState({ emails: [email] })
      const snoozeUntil = new Date('2099-01-01')
      const next = emailReducer(state, {
        type: 'SNOOZE_EMAILS',
        ids: ['email-1'],
        snoozeUntil,
      })
      expect(next.emails[0].folder).toBe('snoozed')
      expect(next.emails[0].snoozeUntil).toBe(snoozeUntil)
      expect(next.emails[0].snoozedFromFolder).toBe('inbox')
    })
  })

  describe('UNSNOOZE_EMAIL', () => {
    it('moves email back to original folder', () => {
      const email = makeEmail({
        folder: 'snoozed',
        snoozedFromFolder: 'inbox',
      })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'UNSNOOZE_EMAIL', id: 'email-1' })
      expect(next.emails[0].folder).toBe('inbox')
      expect(next.emails[0].snoozeUntil).toBeUndefined()
    })

    it('defaults to inbox if no snoozedFromFolder', () => {
      const email = makeEmail({ folder: 'snoozed' })
      const state = makeState({ emails: [email] })
      const next = emailReducer(state, { type: 'UNSNOOZE_EMAIL', id: 'email-1' })
      expect(next.emails[0].folder).toBe('inbox')
    })
  })
})
