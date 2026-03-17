/**
 * Additional EmailContext tests targeting uncovered branches in filteredEmails,
 * matchesDateRange, selectAll, and addLabels deduplication.
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { EmailProvider, useEmail } from '../EmailContext'
import { ToastProvider } from '../ToastContext'
import { RepositoryProvider } from '../RepositoryContext'
import { SettingsProvider } from '../SettingsContext'
import { AppProvider } from '../AppContext'
import { AccountProvider } from '../AccountContext'
import { ContactsProvider } from '../ContactsContext'
import { OrganizationProvider } from '../OrganizationContext'
import { FeaturesProvider } from '../FeaturesContext'
import { createMockRepositories } from '@/test/mock-repositories'
import { ALL_ACCOUNTS_ID } from '@/constants'
import type { Email } from '@/types'
import type { ReactNode } from 'react'

const makeEmail = (overrides: Partial<Email> = {}): Email => ({
  id: 'email-1',
  accountId: 'account-1',
  accountColor: '#000',
  from: { name: 'Sender', email: 'sender@example.com' },
  to: [{ name: 'Recipient', email: 'recipient@example.com' }],
  subject: 'Test Subject',
  preview: 'Test preview',
  body: '<p>Test body</p>',
  date: new Date('2026-01-15'),
  isRead: false,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox' as const,
  labels: [],
  threadId: 'thread-1',
  isDraft: false,
  ...overrides,
})

function createWrapper(mockRepos?: ReturnType<typeof createMockRepositories>) {
  const repos = mockRepos ?? createMockRepositories()
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

describe('EmailContext - matchesDateRange branches', () => {
  it('filters emails using "today" date range', async () => {
    const repos = createMockRepositories()
    // Email from today (within range)
    const todayEmail = makeEmail({ id: 'today', date: new Date() })
    // Old email (out of range)
    const oldEmail = makeEmail({ id: 'old', date: new Date('2020-01-01') })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [todayEmail, oldEmail],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    act(() => {
      result.current.setSearchFilters({
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachment: null,
        isUnread: null,
        isStarred: null,
        dateRange: 'today',
      })
    })

    // Only today's email should pass the date filter
    expect(result.current.filteredEmails.find((e) => e.id === 'today')).toBeTruthy()
    expect(result.current.filteredEmails.find((e) => e.id === 'old')).toBeFalsy()
  })

  it('filters emails using "week" date range', async () => {
    const repos = createMockRepositories()
    const recentEmail = makeEmail({ id: 'recent', date: new Date() })
    const oldEmail = makeEmail({ id: 'old', date: new Date('2020-01-01') })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [recentEmail, oldEmail],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    act(() => {
      result.current.setSearchFilters({
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachment: null,
        isUnread: null,
        isStarred: null,
        dateRange: 'week',
      })
    })

    expect(result.current.filteredEmails.find((e) => e.id === 'recent')).toBeTruthy()
    expect(result.current.filteredEmails.find((e) => e.id === 'old')).toBeFalsy()
  })

  it('filters emails using "month" date range', async () => {
    const repos = createMockRepositories()
    const recentEmail = makeEmail({ id: 'recent', date: new Date() })
    const oldEmail = makeEmail({ id: 'old', date: new Date('2020-01-01') })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [recentEmail, oldEmail],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    act(() => {
      result.current.setSearchFilters({
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachment: null,
        isUnread: null,
        isStarred: null,
        dateRange: 'month',
      })
    })

    expect(result.current.filteredEmails.find((e) => e.id === 'recent')).toBeTruthy()
    expect(result.current.filteredEmails.find((e) => e.id === 'old')).toBeFalsy()
  })

  it('filters emails using "year" date range', async () => {
    const repos = createMockRepositories()
    const recentEmail = makeEmail({ id: 'recent', date: new Date() })
    const oldEmail = makeEmail({ id: 'old', date: new Date('2010-01-01') })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [recentEmail, oldEmail],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    act(() => {
      result.current.setSearchFilters({
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachment: null,
        isUnread: null,
        isStarred: null,
        dateRange: 'year',
      })
    })

    expect(result.current.filteredEmails.find((e) => e.id === 'recent')).toBeTruthy()
    expect(result.current.filteredEmails.find((e) => e.id === 'old')).toBeFalsy()
  })

  it('custom range with dateFrom — excludes emails before it', async () => {
    const repos = createMockRepositories()
    const futureEmail = makeEmail({ id: 'future', date: new Date('2030-06-01') })
    const pastEmail = makeEmail({ id: 'past', date: new Date('2026-01-01') })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [futureEmail, pastEmail],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    act(() => {
      result.current.setSearchFilters({
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachment: null,
        isUnread: null,
        isStarred: null,
        dateRange: 'custom',
        dateFrom: new Date('2028-01-01'),
        dateTo: undefined,
      })
    })

    expect(result.current.filteredEmails.find((e) => e.id === 'future')).toBeTruthy()
    expect(result.current.filteredEmails.find((e) => e.id === 'past')).toBeFalsy()
  })

  it('custom range with dateTo — excludes emails after it', async () => {
    const repos = createMockRepositories()
    const earlyEmail = makeEmail({ id: 'early', date: new Date('2026-01-01') })
    const lateEmail = makeEmail({ id: 'late', date: new Date('2030-06-01') })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [earlyEmail, lateEmail],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    act(() => {
      result.current.setSearchFilters({
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachment: null,
        isUnread: null,
        isStarred: null,
        dateRange: 'custom',
        dateFrom: undefined,
        dateTo: new Date('2027-01-01'),
      })
    })

    expect(result.current.filteredEmails.find((e) => e.id === 'early')).toBeTruthy()
    expect(result.current.filteredEmails.find((e) => e.id === 'late')).toBeFalsy()
  })
})

describe('EmailContext - selectAll when filteredEmails is empty', () => {
  it('selectAll with no emails results in empty selectedIds', async () => {
    const repos = createMockRepositories()
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.selectAll()
    })

    expect(result.current.selectedIds.size).toBe(0)
  })
})

describe('EmailContext - addLabels deduplication', () => {
  it('does not duplicate labels when adding an existing label', async () => {
    const repos = createMockRepositories()
    const email = makeEmail({ id: 'e1', labels: ['important'] })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [email],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(1))

    act(() => {
      result.current.addLabels(['e1'], ['important'])
    })

    // The label should be present but not duplicated
    const labels = result.current.emails.find((e) => e.id === 'e1')?.labels ?? []
    const importantCount = labels.filter((l) => l === 'important').length
    expect(importantCount).toBe(1)
  })
})

describe('EmailContext - ALL_ACCOUNTS_ID path', () => {
  it('returns emails from all accounts when currentAccountId is ALL_ACCOUNTS_ID', async () => {
    const repos = createMockRepositories()
    const email1 = makeEmail({ id: 'e1', accountId: 'account-1', folder: 'inbox' })
    const email2 = makeEmail({ id: 'e2', accountId: 'account-2', folder: 'inbox' })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [email1, email2],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    // Default currentAccountId is ALL_ACCOUNTS_ID
    expect(result.current.currentAccountId).toBe(ALL_ACCOUNTS_ID)
    // Both emails from different accounts should be in filteredEmails
    expect(result.current.filteredEmails).toHaveLength(2)
  })
})

describe('EmailContext - starred virtual folder', () => {
  it('filters out non-starred emails in starred folder', async () => {
    const repos = createMockRepositories()
    const starred = makeEmail({ id: 'e1', folder: 'inbox', isStarred: true })
    const unstarred = makeEmail({ id: 'e2', folder: 'inbox', isStarred: false })
    const starredInTrash = makeEmail({ id: 'e3', folder: 'trash', isStarred: true })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [starred, unstarred, starredInTrash],
      total: 3,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(3))

    act(() => {
      result.current.setFolder('starred')
    })

    // Only starred non-trash emails should appear
    expect(result.current.filteredEmails.find((e) => e.id === 'e1')).toBeTruthy()
    expect(result.current.filteredEmails.find((e) => e.id === 'e2')).toBeFalsy()
    expect(result.current.filteredEmails.find((e) => e.id === 'e3')).toBeFalsy()
  })
})

describe('EmailContext - emptyFolder', () => {
  it('removes all emails in the specified folder', async () => {
    const repos = createMockRepositories()
    const trashEmail = makeEmail({ id: 'e1', folder: 'trash' })
    const inboxEmail = makeEmail({ id: 'e2', folder: 'inbox' })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [trashEmail, inboxEmail],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(2))

    act(() => {
      result.current.emptyFolder('trash')
    })

    expect(result.current.emails.find((e) => e.id === 'e1')).toBeUndefined()
    expect(result.current.emails.find((e) => e.id === 'e2')).toBeDefined()
    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalledWith(['e1'])
  })
})

describe('EmailContext - deletePermanently', () => {
  it('permanently removes emails', async () => {
    const repos = createMockRepositories()
    const email = makeEmail({ id: 'e1', folder: 'trash' })
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [email],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmail(), { wrapper })

    await waitFor(() => expect(result.current.emails).toHaveLength(1))

    act(() => {
      result.current.deletePermanently(['e1'])
    })

    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalledWith(['e1'])
    expect(result.current.emails.find((e) => e.id === 'e1')).toBeUndefined()
  })
})
