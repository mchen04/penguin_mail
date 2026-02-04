import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { EmailView } from './EmailView'
import type { Email } from '@/types/email'

// Mock email for testing
const mockEmail: Email = {
  id: 'test-email-1',
  accountId: 'ucr',
  accountColor: 'blue',
  from: { name: 'John Doe', email: 'john@example.com' },
  to: [{ name: 'Michael Chen', email: 'mchen023@ucr.edu' }],
  subject: 'Test Email Subject',
  preview: 'This is a preview of the email...',
  body: '<p>This is the email body content.</p>',
  date: new Date('2025-01-15T10:00:00'),
  isRead: true,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox',
  labels: [],
  threadId: 'thread-1',
  isDraft: false,
}

describe('EmailView', () => {
  const mockOnBack = vi.fn()
  const mockOnToggleStar = vi.fn()
  const mockOnArchive = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email subject', () => {
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Test Email Subject')).toBeInTheDocument()
  })

  it('renders sender name', () => {
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )

    await user.click(screen.getByRole('button', { name: /back to inbox/i }))
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleStar when star button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )

    await user.click(screen.getByRole('button', { name: /star/i }))
    expect(mockOnToggleStar).toHaveBeenCalledTimes(1)
  })

  it('calls onArchive when archive button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )

    await user.click(screen.getByRole('button', { name: /archive/i }))
    expect(mockOnArchive).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('renders reply button', () => {
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByRole('button', { name: /^reply$/i })).toBeInTheDocument()
  })

  it('renders reply all button', () => {
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByRole('button', { name: /reply all/i })).toBeInTheDocument()
  })

  it('renders forward button', () => {
    render(
      <EmailView
        email={mockEmail}
        onBack={mockOnBack}
        onToggleStar={mockOnToggleStar}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByRole('button', { name: /forward/i })).toBeInTheDocument()
  })
})

describe('Email Reply Functionality', () => {
  it('reply button exists and is clickable', async () => {
    const user = userEvent.setup()
    render(
      <EmailView
        email={mockEmail}
        onBack={vi.fn()}
        onToggleStar={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const replyButton = screen.getByRole('button', { name: /^reply$/i })
    expect(replyButton).toBeInTheDocument()
    // Click should open compose window (action handled by AppContext)
    await user.click(replyButton)
    // No error thrown means the button works
  })

  it('reply all button exists and is clickable', async () => {
    const user = userEvent.setup()
    render(
      <EmailView
        email={mockEmail}
        onBack={vi.fn()}
        onToggleStar={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const replyAllButton = screen.getByRole('button', { name: /reply all/i })
    expect(replyAllButton).toBeInTheDocument()
    await user.click(replyAllButton)
  })

  it('forward button exists and is clickable', async () => {
    const user = userEvent.setup()
    render(
      <EmailView
        email={mockEmail}
        onBack={vi.fn()}
        onToggleStar={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const forwardButton = screen.getByRole('button', { name: /forward/i })
    expect(forwardButton).toBeInTheDocument()
    await user.click(forwardButton)
  })
})

describe('Email with Attachments', () => {
  const emailWithAttachment: Email = {
    ...mockEmail,
    id: 'test-email-2',
    hasAttachment: true,
    attachments: [
      {
        id: 'att-1',
        name: 'document.pdf',
        size: 125000,
        mimeType: 'application/pdf',
      },
    ],
  }

  it('displays attachments section when email has attachments', () => {
    render(
      <EmailView
        email={emailWithAttachment}
        onBack={vi.fn()}
        onToggleStar={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
  })
})
