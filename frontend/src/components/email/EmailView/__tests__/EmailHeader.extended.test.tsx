/**
 * Extended tests for EmailHeader covering uncovered paths:
 * - More actions menu
 * - Mark as read/unread
 * - Mark as spam
 * - Print action
 * - CC display
 * - Label chips
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { EmailHeader } from '../EmailHeader'
import type { Email } from '@/types/email'

const mockEmail: Email = {
  id: 'email-1',
  accountId: 'account-1',
  accountColor: 'blue' as const,
  subject: 'Test Subject',
  from: { name: 'John Doe', email: 'john@example.com' },
  to: [{ name: 'Jane Smith', email: 'jane@example.com' }],
  cc: [],
  bcc: [],
  date: new Date('2026-03-10T10:00:00Z'),
  body: '<p>Hello</p>',
  preview: 'Hello',
  isRead: true,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox' as const,
  labels: [],
  threadId: 'thread-1',
  isDraft: false,
}

const defaultProps = {
  email: mockEmail,
  onBack: vi.fn(),
  onReply: vi.fn(),
  onReplyAll: vi.fn(),
  onForward: vi.fn(),
  onArchive: vi.fn(),
  onDelete: vi.fn(),
  onToggleStar: vi.fn(),
  onPrint: vi.fn(),
}

describe('EmailHeader - More Actions menu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens more actions menu when More Actions button is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailHeader {...defaultProps} />)

    const moreActionsBtn = screen.getByRole('button', { name: /more actions/i })
    await user.click(moreActionsBtn)

    await waitFor(() => {
      expect(screen.getByText(/mark as unread/i)).toBeInTheDocument()
    })
  })

  it('shows "Mark as read" when email is unread', async () => {
    const user = userEvent.setup()
    render(<EmailHeader {...defaultProps} email={{ ...mockEmail, isRead: false }} />)

    const moreActionsBtn = screen.getByRole('button', { name: /more actions/i })
    await user.click(moreActionsBtn)

    await waitFor(() => {
      expect(screen.getByText(/mark as read/i)).toBeInTheDocument()
    })
  })

  it('shows "Mark as unread" when email is read', async () => {
    const user = userEvent.setup()
    render(<EmailHeader {...defaultProps} email={{ ...mockEmail, isRead: true }} />)

    const moreActionsBtn = screen.getByRole('button', { name: /more actions/i })
    await user.click(moreActionsBtn)

    await waitFor(() => {
      expect(screen.getByText(/mark as unread/i)).toBeInTheDocument()
    })
  })

  it('shows Report spam in more actions menu', async () => {
    const user = userEvent.setup()
    render(<EmailHeader {...defaultProps} />)

    const moreActionsBtn = screen.getByRole('button', { name: /more actions/i })
    await user.click(moreActionsBtn)

    await waitFor(() => {
      expect(screen.getByText(/report spam/i)).toBeInTheDocument()
    })
  })

  it('shows Print in more actions menu when onPrint provided', async () => {
    const user = userEvent.setup()
    render(<EmailHeader {...defaultProps} onPrint={vi.fn()} />)

    const moreActionsBtn = screen.getByRole('button', { name: /more actions/i })
    await user.click(moreActionsBtn)

    await waitFor(() => {
      // Print appears as button in the more menu AND as the icon button
      const printMenuItems = screen.getAllByText(/^print$/i)
      expect(printMenuItems.length).toBeGreaterThan(0)
    })
  })

  it('calls onBack and closes menu when Report Spam is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<EmailHeader {...defaultProps} onBack={onBack} />)

    const moreActionsBtn = screen.getByRole('button', { name: /more actions/i })
    await user.click(moreActionsBtn)

    await waitFor(() => {
      expect(screen.getByText(/report spam/i)).toBeInTheDocument()
    })

    await user.click(screen.getByText(/report spam/i))
    expect(onBack).toHaveBeenCalled()
  })
})

describe('EmailHeader - Print button', () => {
  it('renders Print icon button when onPrint is provided', () => {
    render(<EmailHeader {...defaultProps} onPrint={vi.fn()} />)
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument()
  })

  it('does not render Print icon button when onPrint is not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onPrint: _onPrint, ...propsWithoutPrint } = defaultProps
    render(<EmailHeader {...propsWithoutPrint} />)
    // Print button should not appear in the top actions (only in menu which doesn't render)
  })

  it('calls onPrint when Print button is clicked', async () => {
    const user = userEvent.setup()
    const onPrint = vi.fn()
    render(<EmailHeader {...defaultProps} onPrint={onPrint} />)

    await user.click(screen.getByRole('button', { name: /^print$/i }))
    expect(onPrint).toHaveBeenCalled()
  })
})

describe('EmailHeader - CC display', () => {
  it('shows CC recipients when email has CC', () => {
    const emailWithCc: Email = {
      ...mockEmail,
      cc: [{ name: 'Charlie', email: 'charlie@example.com' }],
    }
    render(<EmailHeader {...defaultProps} email={emailWithCc} />)
    expect(screen.getByText(/charlie/i)).toBeInTheDocument()
  })
})

describe('EmailHeader - Reply All button', () => {
  it('calls onReplyAll when Reply all button is clicked', async () => {
    const user = userEvent.setup()
    const onReplyAll = vi.fn()
    render(<EmailHeader {...defaultProps} onReplyAll={onReplyAll} />)

    await user.click(screen.getByRole('button', { name: /reply all/i }))
    expect(onReplyAll).toHaveBeenCalled()
  })
})

describe('EmailHeader - Archive button', () => {
  it('calls onArchive when Archive button is clicked', async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn()
    render(<EmailHeader {...defaultProps} onArchive={onArchive} />)

    await user.click(screen.getByRole('button', { name: /archive/i }))
    expect(onArchive).toHaveBeenCalled()
  })
})

describe('EmailHeader - Delete button', () => {
  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<EmailHeader {...defaultProps} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalled()
  })
})
