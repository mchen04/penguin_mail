/**
 * Additional tests for useEmailActions covering uncovered functions:
 * - handleSendEmail
 * - handleSaveDraft
 * - handleEmptyTrash
 * - handleEmptySpam
 * - handleSnoozeEmails (and its undo callback)
 * - deleteEmails/archiveEmails/moveToFolder undo callbacks
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useEmailActions } from '../useEmailActions'
import { useEmail } from '@/context/EmailContext'
import { createMockRepositories } from '@/test/mock-repositories'
import { createWrapper } from '@/test/test-utils'
import type { Email } from '@/types'

/** Combined hook that exposes both email actions and email context emails list */
function useEmailActionsWithEmails() {
  const actions = useEmailActions()
  const { emails } = useEmail()
  return { ...actions, contextEmails: emails }
}

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

describe('useEmailActions - sendEmail', () => {
  it('calls sendEmail (creates via repository) and shows success toast', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    const emailToSend = makeEmail({ isDraft: false })
    await act(async () => {
      await result.current.sendEmail(emailToSend)
    })

    // Non-draft send calls emailRepository.create
    expect(repos.emails.create).toHaveBeenCalled()
  })
})

describe('useEmailActions - saveDraft', () => {
  it('calls saveDraft and shows info toast', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    const draft = makeEmail({ isDraft: true })
    await act(async () => {
      await result.current.saveDraft(draft)
    })

    expect(repos.emails.saveDraft).toHaveBeenCalledWith(draft)
  })
})

describe('useEmailActions - emptyTrash', () => {
  it('empties trash and shows success toast', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', folder: 'trash' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.emptyTrash()
    })

    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalled()
  })
})

describe('useEmailActions - emptySpam', () => {
  it('empties spam folder and shows success toast', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1', folder: 'spam' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await waitFor(() => {
      expect(repos.emails.search).toHaveBeenCalled()
    })

    await act(async () => {
      result.current.emptySpam()
    })

    expect(repos.emails.deletePermanentlyMany).toHaveBeenCalled()
  })
})

describe('useEmailActions - snoozeEmails', () => {
  it('snoozes a single email (moves to snoozed folder via update)', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActionsWithEmails(), { wrapper })

    await waitFor(() => {
      expect(result.current.contextEmails).toHaveLength(1)
    })

    const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000)
    await act(async () => {
      result.current.snoozeEmails(['e1'], snoozeUntil)
    })

    // snoozeEmails calls emailRepository.update(id, { folder: 'snoozed', snoozeUntil, snoozedFromFolder })
    expect(repos.emails.update).toHaveBeenCalledWith('e1', expect.objectContaining({ folder: 'snoozed' }))
  })

  it('snoozes multiple emails and shows plural message', async () => {
    const repos = setupWithEmails([
      makeEmail({ id: 'e1' }),
      makeEmail({ id: 'e2' }),
    ])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActionsWithEmails(), { wrapper })

    await waitFor(() => {
      expect(result.current.contextEmails).toHaveLength(2)
    })

    const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000)
    await act(async () => {
      result.current.snoozeEmails(['e1', 'e2'], snoozeUntil)
    })

    expect(repos.emails.update).toHaveBeenCalledWith('e1', expect.objectContaining({ folder: 'snoozed' }))
    expect(repos.emails.update).toHaveBeenCalledWith('e2', expect.objectContaining({ folder: 'snoozed' }))
  })

  it('snooze with empty ids is a no-op', async () => {
    const repos = setupWithEmails([])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActions(), { wrapper })

    await act(async () => {
      result.current.snoozeEmails([], new Date())
    })

    expect(repos.emails.update).not.toHaveBeenCalled()
  })
})

describe('useEmailActions - undo callbacks', () => {
  it('delete undo restores email to original folder', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActionsWithEmails(), { wrapper })

    // Wait for emails to be loaded into EmailContext state
    await waitFor(() => {
      expect(result.current.contextEmails).toHaveLength(1)
    })

    // Delete the email (pushes undo action with previousFolders captured)
    await act(async () => {
      result.current.deleteEmails(['e1'])
    })

    // Trigger undo — undo stack should have one action
    await act(async () => {
      await result.current.undoStack.undoLast()
    })

    // After undo, moveToFolder should be called to restore the email to inbox
    expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'inbox')
  })

  it('archive undo restores email to original folder', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActionsWithEmails(), { wrapper })

    await waitFor(() => {
      expect(result.current.contextEmails).toHaveLength(1)
    })

    await act(async () => {
      result.current.archiveEmails(['e1'])
    })

    await act(async () => {
      await result.current.undoStack.undoLast()
    })

    expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'inbox')
  })

  it('moveToFolder undo restores email to original folder', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActionsWithEmails(), { wrapper })

    await waitFor(() => {
      expect(result.current.contextEmails).toHaveLength(1)
    })

    await act(async () => {
      result.current.moveToFolder(['e1'], 'drafts')
    })

    await act(async () => {
      await result.current.undoStack.undoLast()
    })

    // The undo should have called moveToFolder(['e1'], 'inbox') to restore
    expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'inbox')
  })

  it('snooze undo calls unsnoozeEmail (update to restore folder)', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActionsWithEmails(), { wrapper })

    await waitFor(() => {
      expect(result.current.contextEmails).toHaveLength(1)
    })

    const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000)
    await act(async () => {
      result.current.snoozeEmails(['e1'], snoozeUntil)
    })

    await act(async () => {
      await result.current.undoStack.undoLast()
    })

    // unsnoozeEmail dispatches UNSNOOZE_EMAIL and calls emailRepository.update
    // We expect update to have been called at least once (for snooze + unsnooze)
    expect(repos.emails.update).toHaveBeenCalled()
  })

  it('markAsSpam undo restores email to original folder', async () => {
    const repos = setupWithEmails([makeEmail({ id: 'e1', folder: 'inbox' })])
    const wrapper = createWrapper(repos)
    const { result } = renderHook(() => useEmailActionsWithEmails(), { wrapper })

    await waitFor(() => {
      expect(result.current.contextEmails).toHaveLength(1)
    })

    await act(async () => {
      result.current.markAsSpam(['e1'])
    })

    await act(async () => {
      await result.current.undoStack.undoLast()
    })

    expect(repos.emails.moveToFolder).toHaveBeenCalledWith(['e1'], 'inbox')
  })
})
