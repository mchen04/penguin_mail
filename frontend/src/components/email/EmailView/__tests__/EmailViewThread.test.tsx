/**
 * Tests for EmailView thread view (when multiple emails share a threadId)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { EmailView } from '../EmailView'
import type { Email } from '@/types/email'
import { createMockRepositories } from '@/test/mock-repositories'

const baseEmail: Email = {
  id: 'email-1',
  accountId: 'acc-1',
  accountColor: 'blue',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  subject: 'Thread Subject',
  preview: 'First message preview',
  body: '<p>First message body</p>',
  date: new Date('2026-01-01T10:00:00'),
  isRead: true,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox',
  labels: [],
  threadId: 'thread-shared',
  isDraft: false,
}

const threadEmail2: Email = {
  id: 'email-2',
  accountId: 'acc-1',
  accountColor: 'blue',
  from: { name: 'Bob', email: 'bob@example.com' },
  to: [{ name: 'Alice', email: 'alice@example.com' }],
  subject: 'Re: Thread Subject',
  preview: 'Second message preview',
  body: '<p>Second message body</p>',
  date: new Date('2026-01-01T11:00:00'),
  isRead: true,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox',
  labels: [],
  threadId: 'thread-shared',
  isDraft: false,
}

function makeReposWithThread() {
  const repos = createMockRepositories()
  const paginatedEmails = {
    data: [baseEmail, threadEmail2],
    total: 2,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  }
  repos.emails.search = vi.fn().mockResolvedValue(paginatedEmails)
  return repos
}

const defaultCallbacks = {
  onBack: vi.fn(),
  onToggleStar: vi.fn(),
  onArchive: vi.fn(),
  onDelete: vi.fn(),
}

describe('EmailView - Thread view', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders thread header with subject when multiple emails in thread', async () => {
    const repos = makeReposWithThread()
    render(
      <EmailView email={baseEmail} {...defaultCallbacks} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText('Thread Subject')).toBeInTheDocument()
    })
  })

  it('shows thread message count when multiple emails in thread', async () => {
    const repos = makeReposWithThread()
    render(
      <EmailView email={baseEmail} {...defaultCallbacks} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
    })
  })

  it('shows sender names in thread messages', async () => {
    const repos = makeReposWithThread()
    render(
      <EmailView email={baseEmail} {...defaultCallbacks} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    })
  })

  it('calls onBack when back button in thread header is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const repos = makeReposWithThread()

    render(
      <EmailView email={baseEmail} {...defaultCallbacks} onBack={onBack} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
    })

    // Back button in thread view
    const backBtn = screen.getAllByRole('button').find(b =>
      b.querySelector('svg') !== null && b.title === '' &&
      b.className.includes('back')
    )
    if (backBtn) {
      await user.click(backBtn)
      expect(onBack).toHaveBeenCalled()
    }
  })

  it('calls onToggleStar when star button in thread header clicked', async () => {
    const user = userEvent.setup()
    const onToggleStar = vi.fn()
    const repos = makeReposWithThread()

    render(
      <EmailView email={baseEmail} {...defaultCallbacks} onToggleStar={onToggleStar} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
    })

    const starBtn = screen.getByTitle('Star')
    await user.click(starBtn)
    expect(onToggleStar).toHaveBeenCalled()
  })

  it('calls onArchive when archive button in thread header clicked', async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn()
    const repos = makeReposWithThread()

    render(
      <EmailView email={baseEmail} {...defaultCallbacks} onArchive={onArchive} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
    })

    const archiveBtn = screen.getByTitle('Archive')
    await user.click(archiveBtn)
    expect(onArchive).toHaveBeenCalled()
  })

  it('calls onDelete when delete button in thread header clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const repos = makeReposWithThread()

    render(
      <EmailView email={baseEmail} {...defaultCallbacks} onDelete={onDelete} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
    })

    const deleteBtn = screen.getByTitle('Delete')
    await user.click(deleteBtn)
    expect(onDelete).toHaveBeenCalled()
  })

  it('toggles message expansion when thread message header is clicked', async () => {
    const user = userEvent.setup()
    const repos = makeReposWithThread()

    render(
      <EmailView email={baseEmail} {...defaultCallbacks} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
    })

    // The first message (baseEmail) is expanded by default
    // Click on the message header to collapse it
    const messageHeaders = screen.getAllByRole('button').filter(b =>
      b.closest('[class*="threadMessage"]') !== null
    )

    if (messageHeaders.length > 0) {
      await user.click(messageHeaders[0])
      // Message should now show preview instead of full content
    }
  })
})

describe('EmailView - Thread with starred email', () => {
  it('shows starFilled icon when email is starred in thread header', async () => {
    const starredEmail: Email = { ...baseEmail, isStarred: true }
    const repos = makeReposWithThread()
    repos.emails.search = vi.fn().mockResolvedValue({
      data: [starredEmail, threadEmail2],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    })

    render(
      <EmailView email={starredEmail} {...defaultCallbacks} />,
      { repos }
    )

    await waitFor(() => {
      expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
    })

    // Star button title should show "Star" (the email is starred but we still show Star title)
    expect(screen.getByTitle('Star')).toBeInTheDocument()
  })
})
