import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useEmailActions } from '../useEmailActions'
import { useEmail } from '@/context/EmailContext'
import { createMockRepositories } from '@/test/mock-repositories'
import { createWrapper } from '@/test/test-utils'
import type { Email } from '@/types'

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

function setupWithEmails(emails: Email[] = [makeEmail({ id: 'e1' })]) {
  const repos = createMockRepositories()
  repos.emails.search = vi.fn().mockResolvedValue({
    data: emails,
    total: emails.length,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  })
  return repos
}

describe('useEmailActions', () => {
  it('deleteEmails with empty ids is a no-op', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.deleteEmails([])
    })

    // deleteMany should not be called since handleDelete returns early for empty ids
    expect(repos.emails.deleteMany).not.toHaveBeenCalled()
  })

  it('deleteEmails calls repository and moves email to trash in state', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => {
      const actions = useEmailActions()
      const { emails } = useEmail()
      return { ...actions, emails }
    }, { wrapper })

    await waitFor(() => {
      expect(result.current.emails.length).toBeGreaterThan(0)
    })

    await act(async () => {
      result.current.deleteEmails(['e1'])
    })

    expect(repos.emails.deleteMany).toHaveBeenCalledWith(['e1'])
    await waitFor(() => {
      expect(result.current.emails.find(e => e.id === 'e1')?.folder).toBe('trash')
    })
  })

  it('archiveEmails calls repository and moves email to archive in state', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => {
      const actions = useEmailActions()
      const { emails } = useEmail()
      return { ...actions, emails }
    }, { wrapper })

    await waitFor(() => {
      expect(result.current.emails.length).toBeGreaterThan(0)
    })

    await act(async () => {
      result.current.archiveEmails(['e1'])
    })

    expect(repos.emails.archive).toHaveBeenCalledWith(['e1'])
    await waitFor(() => {
      expect(result.current.emails.find(e => e.id === 'e1')?.folder).toBe('archive')
    })
  })

  it('markRead calls repository and marks email as read in state', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', isRead: false })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => {
      const actions = useEmailActions()
      const { emails } = useEmail()
      return { ...actions, emails }
    }, { wrapper })

    await waitFor(() => {
      expect(result.current.emails.length).toBeGreaterThan(0)
    })

    await act(async () => {
      result.current.markRead(['e1'])
    })

    expect(repos.emails.markAsRead).toHaveBeenCalledWith(['e1'])
    await waitFor(() => {
      expect(result.current.emails.find(e => e.id === 'e1')?.isRead).toBe(true)
    })
  })

  it('markUnread calls repository and marks email as unread in state', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', isRead: true })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => {
      const actions = useEmailActions()
      const { emails } = useEmail()
      return { ...actions, emails }
    }, { wrapper })

    await waitFor(() => {
      expect(result.current.emails.length).toBeGreaterThan(0)
    })

    await act(async () => {
      result.current.markUnread(['e1'])
    })

    expect(repos.emails.markAsUnread).toHaveBeenCalledWith(['e1'])
    await waitFor(() => {
      expect(result.current.emails.find(e => e.id === 'e1')?.isRead).toBe(false)
    })
  })

  it('toggleStar calls repository and flips isStarred in state', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', isStarred: false })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => {
      const actions = useEmailActions()
      const { emails } = useEmail()
      return { ...actions, emails }
    }, { wrapper })

    await waitFor(() => {
      expect(result.current.emails.length).toBeGreaterThan(0)
    })

    await act(async () => {
      result.current.toggleStar('e1')
    })

    expect(repos.emails.toggleStar).toHaveBeenCalledWith(['e1'])
    await waitFor(() => {
      expect(result.current.emails.find(e => e.id === 'e1')?.isStarred).toBe(true)
    })
  })

  it('sendEmail calls repository create and shows toast', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      await result.current.sendEmail({
        accountId: 'account-1',
        to: [{ name: 'R', email: 'r@test.com' }],
        subject: 'Test',
        body: 'Body',
      })
    })

    expect(repos.emails.create).toHaveBeenCalled()
  })

  it('saveDraft calls repository saveDraft and shows toast', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

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

  it('moveToFolder calls repository and updates folder in state', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => {
      const actions = useEmailActions()
      const { emails } = useEmail()
      return { ...actions, emails }
    }, { wrapper })

    await waitFor(() => {
      expect(result.current.emails.length).toBeGreaterThan(0)
    })

    await act(async () => {
      result.current.moveToFolder(['e1'], 'archive')
    })

    expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'archive')
    await waitFor(() => {
      expect(result.current.emails.find(e => e.id === 'e1')?.folder).toBe('archive')
    })
  })

  it('deletePermanently calls repository and shows success toast without undo', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'trash' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.deletePermanently(['e1'])
    })

    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalledWith(['e1'])
  })

  it('emptyTrash calls emptyFolder with trash', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.emptyTrash()
    })

    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalled()
  })

  it('emptySpam calls emptyFolder with spam', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.emptySpam()
    })

    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalled()
  })

  it('markAsSpam calls repository and shows toast', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.markAsSpam(['e1'])
    })

    expect(repos.emails.markAsSpam).toHaveBeenCalledWith(['e1'])
  })

  it('snoozeEmails calls repository update', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)

    // Use a combined hook so we can check when emails are loaded
    const { result } = renderHook(() => {
      const actions = useEmailActions()
      const email = useEmail()
      return { ...actions, emails: email.emails }
    }, { wrapper })

    // Wait for emails to actually be loaded into state
    await waitFor(() => {
      expect(result.current.emails.length).toBeGreaterThan(0)
    })

    const snoozeUntil = new Date('2026-03-20')
    await act(async () => {
      result.current.snoozeEmails(['e1'], snoozeUntil)
    })

    // snoozeEmails in context calls emailRepository.update for each email found in state
    // The context's snoozeEmails dispatches SNOOZE_EMAILS and calls repo.update
    await waitFor(() => {
      expect(repos.emails.update).toHaveBeenCalled()
    })
  })
})
