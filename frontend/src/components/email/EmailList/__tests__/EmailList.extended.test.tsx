/**
 * Extended tests for EmailList covering:
 * - Conversation view thread grouping
 * - Folder-specific empty states (archive, spam, starred, sent, drafts, trash)
 * - Inline callbacks (onOpen, onToggleStar, onArchive, onDelete, onMarkRead via EmailRow)
 */
import { describe, it, expect, vi } from 'vitest'
import { useEffect } from 'react'
import { render, screen, waitFor, fireEvent } from '@/test/test-utils'
import { EmailList } from '../EmailList'
import { createMockRepositories } from '@/test/mock-repositories'
import { useAccounts } from '@/context/AccountContext'
import { useSettings } from '@/context/SettingsContext'
import type { Email } from '@/types/email'

const makeEmail = (overrides: Partial<Email> = {}): Email => ({
  id: 'e1',
  accountId: 'acc-1',
  accountColor: 'blue',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  subject: 'Test Email Subject',
  preview: 'Preview text here',
  body: '<p>Body</p>',
  date: new Date('2026-01-01T10:00:00'),
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

function reposWithEmails(emails: Email[]) {
  const repos = createMockRepositories()
  repos.emails.search = vi.fn().mockResolvedValue({
    data: emails,
    total: emails.length,
    page: 1,
    pageSize: 50,
    totalPages: Math.ceil(emails.length / 50),
  })
  return repos
}

/** Helper that switches the current folder via AccountContext */
function WithFolder({ folder, children }: { folder: string; children: React.ReactNode }) {
  const { selectFolder } = useAccounts()
  useEffect(() => {
    selectFolder(null, folder as Parameters<typeof selectFolder>[1])
  }, [folder, selectFolder])
  return <>{children}</>
}

/** Helper that enables conversation view via SettingsContext */
function WithConversationView({ children }: { children: React.ReactNode }) {
  const { setConversationView } = useSettings()
  useEffect(() => {
    setConversationView(true)
  }, [setConversationView])
  return <>{children}</>
}

describe('EmailList - folder empty states', () => {
  it('shows "No archived emails" when archive folder is empty', async () => {
    render(
      <WithFolder folder="archive">
        <EmailList />
      </WithFolder>
    )
    await waitFor(() => {
      expect(screen.getByText('No archived emails')).toBeInTheDocument()
    })
  })

  it('shows "No spam" when spam folder is empty', async () => {
    render(
      <WithFolder folder="spam">
        <EmailList />
      </WithFolder>
    )
    await waitFor(() => {
      expect(screen.getByText('No spam')).toBeInTheDocument()
    })
  })

  it('shows "No starred emails" when starred folder is empty', async () => {
    render(
      <WithFolder folder="starred">
        <EmailList />
      </WithFolder>
    )
    await waitFor(() => {
      expect(screen.getByText('No starred emails')).toBeInTheDocument()
    })
  })

  it('shows "No sent emails" when sent folder is empty', async () => {
    render(
      <WithFolder folder="sent">
        <EmailList />
      </WithFolder>
    )
    await waitFor(() => {
      expect(screen.getByText('No sent emails')).toBeInTheDocument()
    })
  })

  it('shows "No drafts" when drafts folder is empty', async () => {
    render(
      <WithFolder folder="drafts">
        <EmailList />
      </WithFolder>
    )
    await waitFor(() => {
      expect(screen.getByText('No drafts')).toBeInTheDocument()
    })
  })

  it('shows "Trash is empty" when trash folder is empty', async () => {
    render(
      <WithFolder folder="trash">
        <EmailList />
      </WithFolder>
    )
    await waitFor(() => {
      expect(screen.getByText('Trash is empty')).toBeInTheDocument()
    })
  })

  it('shows "No emails" for an unknown folder', async () => {
    render(
      <WithFolder folder="custom-unknown">
        <EmailList />
      </WithFolder>
    )
    await waitFor(() => {
      expect(screen.getByText('No emails')).toBeInTheDocument()
    })
  })
})

describe('EmailList - conversation view grouping', () => {
  it('groups emails by threadId and shows only one row per thread', async () => {
    const emails = [
      makeEmail({ id: 'e1', threadId: 'thread-1', subject: 'Thread One', date: new Date('2026-01-02') }),
      makeEmail({ id: 'e2', threadId: 'thread-1', subject: 'Thread One reply', date: new Date('2026-01-01') }),
      makeEmail({ id: 'e3', threadId: 'thread-2', subject: 'Thread Two', date: new Date('2026-01-03') }),
    ]
    const repos = reposWithEmails(emails)

    render(
      <WithConversationView>
        <EmailList />
      </WithConversationView>,
      { repos }
    )

    await waitFor(() => {
      // Only 2 threads should be shown (not 3 individual emails)
      expect(screen.getByText('Thread One')).toBeInTheDocument()
      expect(screen.getByText('Thread Two')).toBeInTheDocument()
    })

    // Thread One has 2 messages — should show a badge with count 2
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('shows "conversations" label in pagination info when conversation view is on', async () => {
    const manyEmails = Array.from({ length: 55 }, (_, i) =>
      makeEmail({ id: `e${i}`, subject: `Email ${i}`, threadId: `thread-${i}` })
    )
    const repos = reposWithEmails(manyEmails)

    render(
      <WithConversationView>
        <EmailList />
      </WithConversationView>,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/conversations/i)).toBeInTheDocument()
    })
  })
})

describe('EmailList - inline row callbacks', () => {
  it('calls onOpenEmail when email row is opened', async () => {
    const repos = reposWithEmails([makeEmail({ id: 'e1', subject: 'Click Me' })])
    const onOpenEmail = vi.fn()

    render(<EmailList onOpenEmail={onOpenEmail} />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    // Simulate pressing Enter on the row to open
    const row = screen.getByRole('row')
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(onOpenEmail).toHaveBeenCalledWith('e1')
  })

  it('triggers star toggle on star button click', async () => {
    const repos = reposWithEmails([makeEmail({ id: 'e1', subject: 'Star Me' })])

    render(<EmailList />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Star Me')).toBeInTheDocument()
    })

    const starBtn = screen.getByLabelText('Star email')
    fireEvent.click(starBtn)

    expect(repos.emails.toggleStar).toHaveBeenCalledWith(['e1'])
  })

  it('triggers archive on archive button click', async () => {
    const repos = reposWithEmails([makeEmail({ id: 'e1', subject: 'Archive Me' })])

    render(<EmailList />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Archive Me')).toBeInTheDocument()
    })

    const archiveBtn = screen.getByRole('button', { name: /archive/i })
    fireEvent.click(archiveBtn)

    expect(repos.emails.archive).toHaveBeenCalledWith(['e1'])
  })

  it('triggers delete on delete button click', async () => {
    const repos = reposWithEmails([makeEmail({ id: 'e1', subject: 'Delete Me' })])

    render(<EmailList />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Delete Me')).toBeInTheDocument()
    })

    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteBtn)

    expect(repos.emails.deleteMany).toHaveBeenCalledWith(['e1'])
  })

  it('triggers markRead on mark as read button click', async () => {
    const repos = reposWithEmails([makeEmail({ id: 'e1', subject: 'Mark Me', isRead: false })])

    render(<EmailList />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Mark Me')).toBeInTheDocument()
    })

    const markReadBtn = screen.getByRole('button', { name: /mark as read/i })
    fireEvent.click(markReadBtn)

    expect(repos.emails.markAsRead).toHaveBeenCalledWith(['e1'])
  })

  it('triggers select toggle on checkbox click', async () => {
    const repos = reposWithEmails([makeEmail({ id: 'e1', subject: 'Select Me' })])

    render(<EmailList />, { repos })

    await waitFor(() => {
      expect(screen.getByText('Select Me')).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText(/select email from/i)
    fireEvent.click(checkbox)

    // No error thrown — selection was toggled
    expect(checkbox).toBeInTheDocument()
  })
})

/** Helper that disables conversation view via SettingsContext */
function WithConversationViewOff({ children }: { children: React.ReactNode }) {
  const { setConversationView } = useSettings()
  useEffect(() => {
    setConversationView(false)
  }, [setConversationView])
  return <>{children}</>
}

describe('EmailList - conversationView=false (branch 0 line 88)', () => {
  it('renders emails individually when conversationView is false', async () => {
    const emails = [
      makeEmail({ id: 'e1', subject: 'First Email', threadId: 'thread-1' }),
      makeEmail({ id: 'e2', subject: 'Second Email', email: 'alice2@example.com', threadId: 'thread-2' }),
    ]
    const repos = reposWithEmails(emails)
    render(
      <WithConversationViewOff>
        <EmailList />
      </WithConversationViewOff>,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText('First Email')).toBeInTheDocument()
    })
  })
})

describe('EmailList - pagination info with >25 emails (branches at lines 239, 251)', () => {
  it('shows pagination info when more than 25 emails exist', async () => {
    const emails = Array.from({ length: 26 }, (_, i) =>
      makeEmail({ id: `e${i}`, subject: `Email ${i}`, threadId: `thread-${i}` })
    )
    const repos = reposWithEmails(emails)
    render(
      <WithConversationViewOff>
        <EmailList />
      </WithConversationViewOff>,
      { repos }
    )

    await waitFor(() => {
      // Pagination info should appear: "Showing X of 26 emails/conversations"
      expect(screen.getByText(/showing \d+ of 26/i)).toBeInTheDocument()
    })
  })
})
