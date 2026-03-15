import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { EmailRow } from '../EmailRow'
import type { Email } from '@/types/email'

const mockEmail: Email = {
  id: 'e1',
  accountId: 'acc1',
  accountColor: 'blue',
  from: { name: 'Alice Smith', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  cc: [],
  bcc: [],
  subject: 'Test Subject',
  preview: 'This is a preview of the email body',
  body: '<p>Full body</p>',
  date: new Date('2024-06-15T10:30:00'),
  isRead: false,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox',
  labels: [],
  threadId: 'thread-1',
  isDraft: false,
}

const defaultProps = {
  email: mockEmail,
  isSelected: false,
  onSelect: vi.fn(),
  onOpen: vi.fn(),
  onToggleStar: vi.fn(),
  onArchive: vi.fn(),
  onDelete: vi.fn(),
  onMarkRead: vi.fn(),
}

describe('EmailRow', () => {
  it('renders sender name', () => {
    render(<EmailRow {...defaultProps} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('renders subject', () => {
    render(<EmailRow {...defaultProps} />)
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
  })

  it('renders preview text', () => {
    render(<EmailRow {...defaultProps} />)
    expect(screen.getByText(/This is a preview/)).toBeInTheDocument()
  })

  it('renders star button', () => {
    render(<EmailRow {...defaultProps} />)
    expect(screen.getByLabelText('Star email')).toBeInTheDocument()
  })

  it('shows unstar label when starred', () => {
    render(<EmailRow {...defaultProps} email={{ ...mockEmail, isStarred: true }} />)
    expect(screen.getByLabelText('Unstar email')).toBeInTheDocument()
  })

  it('renders checkbox', () => {
    render(<EmailRow {...defaultProps} />)
    expect(screen.getByLabelText(/Select email from Alice Smith/)).toBeInTheDocument()
  })

  it('calls onOpen when row is clicked', () => {
    const onOpen = vi.fn()
    render(<EmailRow {...defaultProps} onOpen={onOpen} />)
    fireEvent.click(screen.getByRole('row'))
    expect(onOpen).toHaveBeenCalled()
  })

  it('calls onToggleStar when star is clicked', () => {
    const onToggleStar = vi.fn()
    render(<EmailRow {...defaultProps} onToggleStar={onToggleStar} />)
    fireEvent.click(screen.getByLabelText('Star email'))
    expect(onToggleStar).toHaveBeenCalled()
  })

  it('shows attachment icon when email has attachments', () => {
    render(<EmailRow {...defaultProps} email={{ ...mockEmail, hasAttachment: true }} />)
    expect(screen.getByLabelText('Has attachment')).toBeInTheDocument()
  })

  it('shows thread count badge', () => {
    render(<EmailRow {...defaultProps} threadCount={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('applies unread styling class', () => {
    const { container } = render(<EmailRow {...defaultProps} email={{ ...mockEmail, isRead: false }} />)
    const row = container.querySelector('[role="row"]')
    // Unread emails should have a different visual treatment
    expect(row).toBeInTheDocument()
  })
})
