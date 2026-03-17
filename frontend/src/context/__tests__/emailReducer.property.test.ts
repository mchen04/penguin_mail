/**
 * Property-based tests for the emailReducer using fast-check.
 *
 * Bug F3: DELETE_PERMANENTLY clears selectedEmailId but NOT selectedIds,
 * leaving stale IDs in the selection set after emails are removed.
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { emailReducer } from '../EmailContext'
import type { EmailState } from '../EmailContext'
import { makeEmail } from '@/test/factories'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildState(overrides: Partial<EmailState> = {}): EmailState {
  return {
    emails: [],
    currentFolder: 'inbox',
    currentAccountId: 'all',
    selectedEmailId: null,
    selectedIds: new Set<string>(),
    lastSelectedId: null,
    searchQuery: '',
    searchFilters: {
      text: '',
      from: '',
      to: '',
      subject: '',
      hasAttachment: null,
      isUnread: null,
      isStarred: null,
      dateRange: 'any',
    },
    sortField: 'date',
    sortDirection: 'desc',
    isLoading: false,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('emailReducer - property tests', () => {
  it('DELETE_PERMANENTLY removes deleted ids from selectedIds (Bug F3)', () => {
    fc.assert(
      fc.property(
        // Generate 1–10 unique string IDs
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 10,
        }),
        // Generate a subset of those IDs to delete (at least one)
        (ids) => {
          fc.pre(ids.length >= 1)

          const emails = ids.map((id) => makeEmail({ id, folder: 'trash' }))
          // Select all emails, then delete a subset
          const deleteCount = Math.max(1, Math.floor(ids.length / 2))
          const toDelete = ids.slice(0, deleteCount)
          const selectedIds = new Set(ids)

          const state = buildState({ emails, selectedIds })
          const nextState = emailReducer(state, {
            type: 'DELETE_PERMANENTLY',
            ids: toDelete,
          })

          // Bug F3: selectedIds still contains deleted IDs after the action
          for (const id of toDelete) {
            expect(nextState.selectedIds.has(id)).toBe(false)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('DELETE_PERMANENTLY removes exactly the emails that existed', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 10,
        }),
        (ids) => {
          const emails = ids.map((id) => makeEmail({ id }))
          const toDelete = ids.slice(0, Math.ceil(ids.length / 2))
          const state = buildState({ emails })
          const nextState = emailReducer(state, {
            type: 'DELETE_PERMANENTLY',
            ids: toDelete,
          })

          const remainingIds = nextState.emails.map((e) => e.id)
          // Deleted emails must not appear in the result
          for (const id of toDelete) {
            expect(remainingIds).not.toContain(id)
          }
          // Non-deleted emails must still appear
          const kept = ids.filter((id) => !toDelete.includes(id))
          for (const id of kept) {
            expect(remainingIds).toContain(id)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('MARK_READ followed by MARK_UNREAD returns all emails to unread', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 8,
        }),
        (ids) => {
          fc.pre(ids.length >= 1)
          const emails = ids.map((id) => makeEmail({ id, isRead: false }))
          const state = buildState({ emails })

          const afterRead = emailReducer(state, { type: 'MARK_READ', ids })
          const afterUnread = emailReducer(afterRead, { type: 'MARK_UNREAD', ids })

          for (const email of afterUnread.emails) {
            expect(email.isRead).toBe(false)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('TOGGLE_STAR applied twice returns email to its original isStarred value', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 8,
        }),
        fc.boolean(),
        (ids, initialStarred) => {
          fc.pre(ids.length >= 1)
          const targetId = ids[0]
          const emails = ids.map((id) =>
            makeEmail({ id, isStarred: id === targetId ? initialStarred : false }),
          )
          const state = buildState({ emails })

          const afterFirst = emailReducer(state, { type: 'TOGGLE_STAR', id: targetId })
          const afterSecond = emailReducer(afterFirst, { type: 'TOGGLE_STAR', id: targetId })

          const email = afterSecond.emails.find((e) => e.id === targetId)
          expect(email?.isStarred).toBe(initialStarred)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('SET_SEARCH sets searchQuery to the given value', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 100 }), (query) => {
        const state = buildState()
        const nextState = emailReducer(state, { type: 'SET_SEARCH', query })
        expect(nextState.searchQuery).toBe(query)
      }),
      { numRuns: 200 },
    )
  })

  it('SET_SELECTION with all email IDs then CLEAR_SELECTION leaves selectedIds empty', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 8,
        }),
        (ids) => {
          const emails = ids.map((id) => makeEmail({ id }))
          const state = buildState({ emails })

          const afterSelect = emailReducer(state, {
            type: 'SET_SELECTION',
            ids: new Set(ids),
          })
          const afterClear = emailReducer(afterSelect, { type: 'CLEAR_SELECTION' })

          expect(afterClear.selectedIds.size).toBe(0)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('selectedIds after SET_SELECTION never contains IDs not in emails', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 8,
        }),
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 5,
        }),
        (emailIds, extraIds) => {
          const emails = emailIds.map((id) => makeEmail({ id }))
          // Attempt to select both real and phantom IDs
          const allIds = new Set([...emailIds, ...extraIds])
          const state = buildState({ emails })

          const nextState = emailReducer(state, {
            type: 'SET_SELECTION',
            ids: allIds,
          })

          // Regression guard: SET_SELECTION must filter out IDs not in emails.
          const existingIds = new Set(emailIds)
          for (const id of nextState.selectedIds) {
            expect(existingIds.has(id)).toBe(true)
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
