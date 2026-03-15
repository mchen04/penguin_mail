import { describe, it, expect, vi, beforeEach } from 'vitest'
import { axe } from 'vitest-axe'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { useApp } from '@/context/AppContext'
import { EmailView } from './EmailView'
import type { Email } from '@/types/email'

/** Renders a component alongside EmailView that exposes AppContext state for assertion. */
function AppStateProbe() {
  const { composeState, composeData } = useApp()
  return (
    <div>
      <span data-testid="compose-state">{composeState}</span>
      <span data-testid="compose-mode">{composeData?.mode ?? ''}</span>
      <span data-testid="compose-reply-to">{composeData?.replyToId ?? ''}</span>
      <span data-testid="compose-fwd-from">{composeData?.forwardedFromId ?? ''}</span>
    </div>
  )
}

function renderWithProbe(email: Email) {
  return render(
    <>
      <AppStateProbe />
      <EmailView
        email={email}
        onBack={vi.fn()}
        onToggleStar={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    </>
  )
}

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
  it('clicking Reply opens compose with mode=reply and correct replyToId', async () => {
    const user = userEvent.setup()
    renderWithProbe(mockEmail)

    await user.click(screen.getByRole('button', { name: /^reply$/i }))

    await waitFor(() => {
      expect(screen.getByTestId('compose-state')).toHaveTextContent('open')
    })
    expect(screen.getByTestId('compose-mode')).toHaveTextContent('reply')
    expect(screen.getByTestId('compose-reply-to')).toHaveTextContent(mockEmail.id)
  })

  it('clicking Reply All opens compose with mode=replyAll', async () => {
    const user = userEvent.setup()
    renderWithProbe(mockEmail)

    await user.click(screen.getByRole('button', { name: /reply all/i }))

    await waitFor(() => {
      expect(screen.getByTestId('compose-state')).toHaveTextContent('open')
    })
    expect(screen.getByTestId('compose-mode')).toHaveTextContent('replyAll')
    expect(screen.getByTestId('compose-reply-to')).toHaveTextContent(mockEmail.id)
  })

  it('clicking Forward opens compose with mode=forward and forwardedFromId', async () => {
    const user = userEvent.setup()
    renderWithProbe(mockEmail)

    await user.click(screen.getByRole('button', { name: /forward/i }))

    await waitFor(() => {
      expect(screen.getByTestId('compose-state')).toHaveTextContent('open')
    })
    expect(screen.getByTestId('compose-mode')).toHaveTextContent('forward')
    expect(screen.getByTestId('compose-fwd-from')).toHaveTextContent(mockEmail.id)
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

describe('EmailView accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmailView
        email={{
          id: 'axe-test',
          accountId: 'acc-1',
          accountColor: 'blue',
          from: { name: 'Sender', email: 'sender@example.com' },
          to: [{ name: 'Recipient', email: 'recipient@example.com' }],
          subject: 'Axe Test Email',
          preview: 'preview',
          body: '<p>Body content</p>',
          date: new Date('2026-01-01T10:00:00'),
          isRead: true,
          isStarred: false,
          hasAttachment: false,
          attachments: [],
          folder: 'inbox' as const,
          labels: [],
          threadId: 'thread-axe',
          isDraft: false,
        }}
        onBack={vi.fn()}
        onToggleStar={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
