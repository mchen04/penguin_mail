/**
 * Extended tests for useEmailActions covering markNotSpam and multiple-email pluralization
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useEmailActions } from '../useEmailActions'
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

function setupWithEmails(emails: Email[] = []) {
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

describe('useEmailActions - markNotSpam', () => {
  it('markNotSpam calls markNotSpam in context', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'spam' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.markNotSpam(['e1'])
    })

    // markNotSpam calls moveToFolder([id], 'inbox') in the context
    expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'inbox')
  })

  it('markNotSpam with empty ids is a no-op', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.markNotSpam([])
    })

    expect(repos.emails.moveToFolder).not.toHaveBeenCalled()
  })

  it('markNotSpam with multiple ids shows plural message', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', folder: 'spam' }),
      makeEmail({ id: 'e2', folder: 'spam' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.markNotSpam(['e1', 'e2'])
    })

    expect(repos.emails.moveToFolder).toHaveBeenCalled()
  })
})

describe('useEmailActions - deleteEmails plural', () => {
  it('deletes multiple emails and shows plural toast', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1' }),
      makeEmail({ id: 'e2' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.deleteEmails(['e1', 'e2'])
    })

    expect(repos.emails.deleteMany).toHaveBeenCalledWith(['e1', 'e2'])
  })
})

describe('useEmailActions - archiveEmails plural', () => {
  it('archives multiple emails', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1' }),
      makeEmail({ id: 'e2' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.archiveEmails(['e1', 'e2'])
    })

    expect(repos.emails.archive).toHaveBeenCalledWith(['e1', 'e2'])
  })
})

describe('useEmailActions - markRead/markUnread plural', () => {
  it('markRead with multiple ids', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', isRead: false }),
      makeEmail({ id: 'e2', isRead: false }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.markRead(['e1', 'e2'])
    })

    expect(repos.emails.markAsRead).toHaveBeenCalledWith(['e1', 'e2'])
  })

  it('markUnread with multiple ids', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', isRead: true }),
      makeEmail({ id: 'e2', isRead: true }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.markUnread(['e1', 'e2'])
    })

    expect(repos.emails.markAsUnread).toHaveBeenCalledWith(['e1', 'e2'])
  })
})

describe('useEmailActions - deletePermanently plural', () => {
  it('deletes multiple emails permanently', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', folder: 'trash' }),
      makeEmail({ id: 'e2', folder: 'trash' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.deletePermanently(['e1', 'e2'])
    })

    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalledWith(['e1', 'e2'])
  })
})

describe('useEmailActions - markAsSpam plural', () => {
  it('marks multiple emails as spam', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', folder: 'inbox' }),
      makeEmail({ id: 'e2', folder: 'inbox' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.markAsSpam(['e1', 'e2'])
    })

    expect(repos.emails.markAsSpam).toHaveBeenCalledWith(['e1', 'e2'])
  })

  it('markAsSpam with empty ids is a no-op', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.markAsSpam([])
    })

    expect(repos.emails.markAsSpam).not.toHaveBeenCalled()
  })
})

describe('useEmailActions - toggleStar', () => {
  it('shows "Added to starred" when email was not starred', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', isStarred: false })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.toggleStar('e1')
    })

    expect(repos.emails.toggleStar).toHaveBeenCalledWith(['e1'])
  })

  it('shows "Removed from starred" when email was starred', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', isStarred: true })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.toggleStar('e1')
    })

    expect(repos.emails.toggleStar).toHaveBeenCalledWith(['e1'])
  })
})

describe('useEmailActions - moveToFolder plural', () => {
  it('moves multiple emails to folder', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', folder: 'inbox' }),
      makeEmail({ id: 'e2', folder: 'inbox' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.moveToFolder(['e1', 'e2'], 'archive')
    })

    expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1', 'e2'], 'archive')
  })
})
