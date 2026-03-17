/**
 * Additional reducer tests targeting uncovered branches.
 */
import { describe, it, expect } from 'vitest'
import { emailReducer, type EmailState } from '../EmailContext'
import type { Email, FolderType } from '@/types/email'

const makeEmail = (overrides: Partial<Email> = {}): Email => ({
  id: 'email-1',
  accountId: 'acc-1',
  accountColor: 'blue',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
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

describe('emailReducer - TOGGLE_SELECTION_RANGE additional branches', () => {
  it('no lastSelectedId: adds id when not already selected', () => {
    const state = makeState({ lastSelectedId: null, selectedIds: new Set() })
    const next = emailReducer(state, {
      type: 'TOGGLE_SELECTION_RANGE',
      id: 'e1',
      filteredIds: ['e1', 'e2', 'e3'],
    })
    expect(next.selectedIds.has('e1')).toBe(true)
    expect(next.lastSelectedId).toBe('e1')
  })

  it('no lastSelectedId: removes id when already selected', () => {
    const state = makeState({ lastSelectedId: null, selectedIds: new Set(['e1']) })
    const next = emailReducer(state, {
      type: 'TOGGLE_SELECTION_RANGE',
      id: 'e1',
      filteredIds: ['e1', 'e2', 'e3'],
    })
    expect(next.selectedIds.has('e1')).toBe(false)
    expect(next.lastSelectedId).toBe('e1')
  })

  it('fallback when lastSelectedId not found in filteredIds', () => {
    const state = makeState({
      lastSelectedId: 'e-missing',
      selectedIds: new Set(),
    })
    const next = emailReducer(state, {
      type: 'TOGGLE_SELECTION_RANGE',
      id: 'e2',
      filteredIds: ['e1', 'e2', 'e3'],
    })
    // Fallback just adds the clicked id
    expect(next.selectedIds.has('e2')).toBe(true)
    expect(next.lastSelectedId).toBe('e2')
  })

  it('fallback when target id not found in filteredIds', () => {
    const state = makeState({
      lastSelectedId: 'e1',
      selectedIds: new Set(['e1']),
    })
    const next = emailReducer(state, {
      type: 'TOGGLE_SELECTION_RANGE',
      id: 'e-missing',
      filteredIds: ['e1', 'e2', 'e3'],
    })
    expect(next.selectedIds.has('e-missing')).toBe(true)
    expect(next.lastSelectedId).toBe('e-missing')
  })

  it('reverse-order range selection (from higher index to lower)', () => {
    const state = makeState({
      selectedIds: new Set(['e5']),
      lastSelectedId: 'e5',
    })
    const next = emailReducer(state, {
      type: 'TOGGLE_SELECTION_RANGE',
      id: 'e1',
      filteredIds: ['e1', 'e2', 'e3', 'e4', 'e5'],
    })
    // Should select e1 through e5
    expect(next.selectedIds.has('e1')).toBe(true)
    expect(next.selectedIds.has('e2')).toBe(true)
    expect(next.selectedIds.has('e3')).toBe(true)
    expect(next.selectedIds.has('e4')).toBe(true)
    expect(next.selectedIds.has('e5')).toBe(true)
  })
})

describe('emailReducer - default case', () => {
  it('returns state unchanged for unknown action type', () => {
    const emails = [makeEmail()]
    const state = makeState({ emails })
    // Cast to any to simulate unknown action
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = emailReducer(state, { type: 'UNKNOWN_ACTION' } as any)
    expect(next).toBe(state)
  })
})

describe('emailReducer - SET_SEARCH_FILTERS', () => {
  it('syncs searchQuery from filters.text', () => {
    const state = makeState()
    const next = emailReducer(state, {
      type: 'SET_SEARCH_FILTERS',
      filters: { ...defaultSearchFilters, text: 'hello', dateRange: 'any' },
    })
    expect(next.searchQuery).toBe('hello')
    expect(next.selectedIds.size).toBe(0)
  })
})

describe('emailReducer - DELETE_PERMANENTLY preserves selected if not deleted', () => {
  it('keeps selectedEmailId when it was not permanently deleted', () => {
    const emails = [makeEmail({ id: 'e1' }), makeEmail({ id: 'e2' })]
    const state = makeState({ emails, selectedEmailId: 'e2' })
    const next = emailReducer(state, { type: 'DELETE_PERMANENTLY', ids: ['e1'] })
    expect(next.selectedEmailId).toBe('e2')
    expect(next.emails).toHaveLength(1)
  })
})

describe('emailReducer - SNOOZE_EMAILS selectedEmailId handling', () => {
  it('clears selectedEmailId when the snoozed email was selected', () => {
    const email = makeEmail({ id: 'e1', folder: 'inbox' })
    const state = makeState({ emails: [email], selectedEmailId: 'e1' })
    const next = emailReducer(state, {
      type: 'SNOOZE_EMAILS',
      ids: ['e1'],
      snoozeUntil: new Date('2099-01-01'),
    })
    expect(next.selectedEmailId).toBeNull()
  })

  it('preserves selectedEmailId when a different email is snoozed', () => {
    const emails = [makeEmail({ id: 'e1' }), makeEmail({ id: 'e2' })]
    const state = makeState({ emails, selectedEmailId: 'e2' })
    const next = emailReducer(state, {
      type: 'SNOOZE_EMAILS',
      ids: ['e1'],
      snoozeUntil: new Date('2099-01-01'),
    })
    expect(next.selectedEmailId).toBe('e2')
  })
})

describe('emailReducer - UNSNOOZE_EMAIL clears selectedEmailId', () => {
  it('clears selectedEmailId when the unsnoozed email was selected and was snoozed', () => {
    const email = makeEmail({ id: 'e1', folder: 'snoozed', snoozedFromFolder: 'inbox' })
    const state = makeState({ emails: [email], selectedEmailId: 'e1' })
    const next = emailReducer(state, { type: 'UNSNOOZE_EMAIL', id: 'e1' })
    expect(next.selectedEmailId).toBeNull()
  })
})
