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

describe('EmailContext', () => {
  describe('useEmail throws outside provider', () => {
    it('throws when used outside EmailProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => {
        renderHook(() => useEmail())
      }).toThrow()
      spy.mockRestore()
    })
  })

  describe('sendEmail', () => {
    it('sends a new email via repository create', async () => {
      const repos = createMockRepositories()
      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.sendEmail({
          accountId: 'account-1',
          to: [{ name: 'R', email: 'r@test.com' }],
          subject: 'Hello',
          body: 'World',
        })
      })

      expect(repos.emails.create).toHaveBeenCalled()
    })

    it('sends an existing draft via repository update', async () => {
      const repos = createMockRepositories()
      const draft = makeEmail({ id: 'draft-1', isDraft: true, folder: 'drafts' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [draft], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.sendEmail({
          id: 'draft-1',
          isDraft: true,
          accountId: 'account-1',
          to: [{ name: 'R', email: 'r@test.com' }],
          subject: 'Hello',
          body: 'World',
        })
      })

      expect(repos.emails.update).toHaveBeenCalled()
    })
  })

  describe('saveDraft', () => {
    it('saves a new draft via repository', async () => {
      const repos = createMockRepositories()
      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.saveDraft({
          accountId: 'account-1',
          to: [{ name: 'R', email: 'r@test.com' }],
          subject: 'Draft',
          body: 'Content',
        })
      })

      expect(repos.emails.saveDraft).toHaveBeenCalled()
    })

    it('updates an existing draft via repository', async () => {
      const repos = createMockRepositories()
      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.saveDraft({
          id: 'draft-1',
          accountId: 'account-1',
          subject: 'Updated Draft',
          body: 'Updated',
        })
      })

      expect(repos.emails.saveDraft).toHaveBeenCalled()
    })
  })

  describe('deleteEmails', () => {
    it('dispatches delete and calls repository deleteMany', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', folder: 'inbox' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.deleteEmails(['e1'])
      })

      expect(repos.emails.deleteMany).toHaveBeenCalledWith(['e1'])
      // Email should be moved to trash in state
      expect(result.current.emails.find((e) => e.id === 'e1')?.folder).toBe('trash')
    })
  })

  describe('archiveEmails', () => {
    it('dispatches archive and calls repository', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', folder: 'inbox' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.archiveEmails(['e1'])
      })

      expect(repos.emails.archive).toHaveBeenCalledWith(['e1'])
      expect(result.current.emails.find((e) => e.id === 'e1')?.folder).toBe('archive')
    })
  })

  describe('markRead / markUnread', () => {
    it('calls repository markAsRead', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', isRead: false })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.markRead(['e1'])
      })

      expect(repos.emails.markAsRead).toHaveBeenCalledWith(['e1'])
      expect(result.current.emails.find((e) => e.id === 'e1')?.isRead).toBe(true)
    })

    it('calls repository markAsUnread', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', isRead: true })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.markUnread(['e1'])
      })

      expect(repos.emails.markAsUnread).toHaveBeenCalledWith(['e1'])
      expect(result.current.emails.find((e) => e.id === 'e1')?.isRead).toBe(false)
    })
  })

  describe('toggleStar', () => {
    it('calls repository toggleStar and flips isStarred', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', isStarred: false })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.toggleStar('e1')
      })

      expect(repos.emails.toggleStar).toHaveBeenCalledWith(['e1'])
      expect(result.current.emails.find((e) => e.id === 'e1')?.isStarred).toBe(true)
    })
  })

  describe('moveToFolder', () => {
    it('dispatches move and calls repository', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', folder: 'inbox' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.moveToFolder(['e1'], 'archive')
      })

      expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'archive')
      expect(result.current.emails.find((e) => e.id === 'e1')?.folder).toBe('archive')
    })
  })

  describe('markAsSpam / markNotSpam', () => {
    it('calls repository markAsSpam', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', folder: 'inbox' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.markAsSpam(['e1'])
      })

      expect(repos.emails.markAsSpam).toHaveBeenCalledWith(['e1'])
      expect(result.current.emails.find((e) => e.id === 'e1')?.folder).toBe('spam')
    })

    it('calls repository moveToFolder for markNotSpam', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', folder: 'spam' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.markNotSpam(['e1'])
      })

      expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'inbox')
      expect(result.current.emails.find((e) => e.id === 'e1')?.folder).toBe('inbox')
    })
  })

  describe('addLabels / removeLabels', () => {
    it('calls repository addLabels', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', labels: [] })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.addLabels(['e1'], ['important'])
      })

      expect(repos.emails.addLabels).toHaveBeenCalledWith(['e1'], ['important'])
      expect(result.current.emails.find((e) => e.id === 'e1')?.labels).toContain('important')
    })

    it('calls repository removeLabels', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', labels: ['important', 'work'] })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.removeLabels(['e1'], ['important'])
      })

      expect(repos.emails.removeLabels).toHaveBeenCalledWith(['e1'], ['important'])
      expect(result.current.emails.find((e) => e.id === 'e1')?.labels).not.toContain('important')
    })
  })

  describe('snoozeEmails / unsnoozeEmail', () => {
    it('snoozes emails and calls repository update', async () => {
      const repos = createMockRepositories()
      const email = makeEmail({ id: 'e1', folder: 'inbox' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [email], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      const snoozeUntil = new Date('2026-03-20')
      act(() => {
        result.current.snoozeEmails(['e1'], snoozeUntil)
      })

      expect(repos.emails.update).toHaveBeenCalled()
      expect(result.current.emails.find((e) => e.id === 'e1')?.folder).toBe('snoozed')
    })

    it('unsnoozes email and calls repository update', async () => {
      const repos = createMockRepositories()
      const snoozedEmail = makeEmail({
        id: 'e1',
        folder: 'snoozed',
        snoozeUntil: new Date('2026-03-20'),
        snoozedFromFolder: 'inbox',
      })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [snoozedEmail], total: 1, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(1)
      })

      act(() => {
        result.current.unsnoozeEmail('e1')
      })

      expect(repos.emails.update).toHaveBeenCalled()
      expect(result.current.emails.find((e) => e.id === 'e1')?.folder).toBe('inbox')
    })
  })

  describe('filteredEmails', () => {
    it('filters emails by current folder', async () => {
      const repos = createMockRepositories()
      const inboxEmail = makeEmail({ id: 'e1', folder: 'inbox' })
      const sentEmail = makeEmail({ id: 'e2', folder: 'sent' })
      repos.emails.search = vi.fn().mockResolvedValue({ data: [inboxEmail, sentEmail], total: 2, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(2)
      })

      // Default folder is inbox, so filteredEmails should only include inbox emails
      expect(result.current.filteredEmails).toHaveLength(1)
      expect(result.current.filteredEmails[0].id).toBe('e1')
    })
  })

  describe('getUnreadCount / getFolderCount / getTotalUnreadCount', () => {
    it('returns correct unread count for a folder', async () => {
      const repos = createMockRepositories()
      const emails = [
        makeEmail({ id: 'e1', folder: 'inbox', isRead: false }),
        makeEmail({ id: 'e2', folder: 'inbox', isRead: true }),
        makeEmail({ id: 'e3', folder: 'inbox', isRead: false }),
      ]
      repos.emails.search = vi.fn().mockResolvedValue({ data: emails, total: 3, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(3)
      })

      expect(result.current.getUnreadCount('inbox')).toBe(2)
    })

    it('returns folder count', async () => {
      const repos = createMockRepositories()
      const emails = [
        makeEmail({ id: 'e1', folder: 'inbox' }),
        makeEmail({ id: 'e2', folder: 'inbox' }),
        makeEmail({ id: 'e3', folder: 'sent' }),
      ]
      repos.emails.search = vi.fn().mockResolvedValue({ data: emails, total: 3, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(3)
      })

      expect(result.current.getFolderCount('inbox')).toBe(2)
    })

    it('returns total unread count (inbox only)', async () => {
      const repos = createMockRepositories()
      const emails = [
        makeEmail({ id: 'e1', folder: 'inbox', isRead: false }),
        makeEmail({ id: 'e2', folder: 'sent', isRead: false }),
        makeEmail({ id: 'e3', folder: 'inbox', isRead: true }),
      ]
      repos.emails.search = vi.fn().mockResolvedValue({ data: emails, total: 3, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.emails).toHaveLength(3)
      })

      // getTotalUnreadCount only counts inbox unread
      expect(result.current.getTotalUnreadCount()).toBe(1)
    })
  })

  describe('selectAll', () => {
    it('selects all filtered emails', async () => {
      const repos = createMockRepositories()
      const emails = [
        makeEmail({ id: 'e1', folder: 'inbox' }),
        makeEmail({ id: 'e2', folder: 'inbox' }),
      ]
      repos.emails.search = vi.fn().mockResolvedValue({ data: emails, total: 2, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.filteredEmails).toHaveLength(2)
      })

      act(() => {
        result.current.selectAll()
      })

      expect(result.current.selectedIds.size).toBe(2)
      expect(result.current.selectedIds.has('e1')).toBe(true)
      expect(result.current.selectedIds.has('e2')).toBe(true)
    })
  })

  describe('toggleSelection', () => {
    it('toggles a single email selection', async () => {
      const repos = createMockRepositories()
      const emails = [
        makeEmail({ id: 'e1', folder: 'inbox' }),
        makeEmail({ id: 'e2', folder: 'inbox' }),
      ]
      repos.emails.search = vi.fn().mockResolvedValue({ data: emails, total: 2, page: 1, pageSize: 50, totalPages: 1 })

      const wrapper = createWrapper(repos)
      const { result } = renderHook(() => useEmail(), { wrapper })

      await waitFor(() => {
        expect(result.current.filteredEmails).toHaveLength(2)
      })

      act(() => {
        result.current.toggleSelection('e1', false)
      })

      expect(result.current.selectedIds.has('e1')).toBe(true)

      act(() => {
        result.current.toggleSelection('e1', false)
      })

      expect(result.current.selectedIds.has('e1')).toBe(false)
    })
  })
})
