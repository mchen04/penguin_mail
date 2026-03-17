/**
 * Tests for useKeyboardShortcuts covering navigation branches that require
 * emails to be loaded in EmailContext:
 * - Escape when selectedEmailId is set → selectEmail(null)  (line 147)
 * - nextEmail (j) when next email exists → selectEmail(nextId)  (line 155)
 * - prevEmail (k) when prev email exists → selectEmail(prevId)  (line 163)
 * - openEmail (o) when nothing selected but emails exist → selectEmail(first) (line 170)
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'
import { useEmail } from '@/context/EmailContext'
import { ToastProvider } from '@/context/ToastContext'
import { RepositoryProvider } from '@/context/RepositoryContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { AppProvider } from '@/context/AppContext'
import { AccountProvider } from '@/context/AccountContext'
import { ContactsProvider } from '@/context/ContactsContext'
import { OrganizationProvider } from '@/context/OrganizationContext'
import { FeaturesProvider } from '@/context/FeaturesContext'
import { EmailProvider } from '@/context/EmailContext'
import { createMockRepositories } from '@/test/mock-repositories'
import type { ReactNode } from 'react'
import type { Email } from '@/types'

const makeEmail = (id: string, overrides: Partial<Email> = {}): Email => ({
  id,
  accountId: 'acc-1',
  accountColor: 'blue',
  from: { name: 'Sender', email: 'sender@example.com' },
  to: [{ name: 'Recipient', email: 'recipient@example.com' }],
  subject: `Email ${id}`,
  preview: 'Preview',
  body: '<p>Body</p>',
  date: new Date('2026-01-01'),
  isRead: false,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox' as const,
  labels: [],
  threadId: `thread-${id}`,
  isDraft: false,
  ...overrides,
})

function createWrapperWithEmails(emails: Email[]) {
  const repos = createMockRepositories()
  repos.emails.search = vi.fn().mockResolvedValue({
    data: emails,
    total: emails.length,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ToastProvider>
        <RepositoryProvider repositories={repos}>
          <SettingsProvider>
            <AppProvider>
              <AccountProvider>
                <ContactsProvider>
                  <OrganizationProvider>
                    <FeaturesProvider>
                      <EmailProvider>{children}</EmailProvider>
                    </FeaturesProvider>
                  </OrganizationProvider>
                </ContactsProvider>
              </AccountProvider>
            </AppProvider>
          </SettingsProvider>
        </RepositoryProvider>
      </ToastProvider>
    )
  }
}

function useCombined(handlers: Parameters<typeof useKeyboardShortcuts>[0] = {}) {
  useKeyboardShortcuts(handlers)
  const { selectEmail, filteredEmails, selectedEmailId } = useEmail()
  return { selectEmail, filteredEmails, selectedEmailId }
}

function fireKeyDown(key: string, options: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
  document.dispatchEvent(event)
}

describe('useKeyboardShortcuts - Escape deselects email (line 147)', () => {
  it('Escape clears selectedEmailId when compose is closed and settings are closed', async () => {
    const wrapper = createWrapperWithEmails([makeEmail('e1')])
    const { result } = renderHook(() => useCombined(), { wrapper })

    // Wait for emails to load
    await waitFor(() => expect(result.current.filteredEmails).toHaveLength(1))

    // Select an email
    act(() => { result.current.selectEmail('e1') })
    await waitFor(() => expect(result.current.selectedEmailId).toBe('e1'))

    // Press Escape — should call selectEmail(null)
    act(() => { fireKeyDown('Escape') })

    await waitFor(() => expect(result.current.selectedEmailId).toBeNull())
  })
})

describe('useKeyboardShortcuts - nextEmail selects next (line 155)', () => {
  it('j key selects the next email when one exists', async () => {
    const emails = [makeEmail('e1'), makeEmail('e2')]
    const wrapper = createWrapperWithEmails(emails)
    const { result } = renderHook(() => useCombined(), { wrapper })

    // Wait for emails to load
    await waitFor(() => expect(result.current.filteredEmails).toHaveLength(2))

    // Select the first email
    act(() => { result.current.selectEmail('e1') })
    await waitFor(() => expect(result.current.selectedEmailId).toBe('e1'))

    // Press j — should advance to e2
    act(() => { fireKeyDown('j') })

    await waitFor(() => expect(result.current.selectedEmailId).toBe('e2'))
  })
})

describe('useKeyboardShortcuts - prevEmail selects prev (line 163)', () => {
  it('k key selects the previous email when one exists', async () => {
    const emails = [makeEmail('e1'), makeEmail('e2')]
    const wrapper = createWrapperWithEmails(emails)
    const { result } = renderHook(() => useCombined(), { wrapper })

    // Wait for emails to load
    await waitFor(() => expect(result.current.filteredEmails).toHaveLength(2))

    // Select the second email
    act(() => { result.current.selectEmail('e2') })
    await waitFor(() => expect(result.current.selectedEmailId).toBe('e2'))

    // Press k — should go back to e1
    act(() => { fireKeyDown('k') })

    await waitFor(() => expect(result.current.selectedEmailId).toBe('e1'))
  })
})

describe('useKeyboardShortcuts - openEmail selects first when nothing selected (line 170)', () => {
  it('o key selects first email when no email is currently selected', async () => {
    const wrapper = createWrapperWithEmails([makeEmail('e1'), makeEmail('e2')])
    const { result } = renderHook(() => useCombined(), { wrapper })

    // Wait for emails to load; nothing selected yet
    await waitFor(() => expect(result.current.filteredEmails).toHaveLength(2))
    expect(result.current.selectedEmailId).toBeNull()

    // Press o — should select first email
    act(() => { fireKeyDown('o') })

    await waitFor(() => expect(result.current.selectedEmailId).toBe('e1'))
  })
})
