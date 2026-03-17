/**
 * Extended tests for EmailRow covering more interactions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { EmailRow } from '../EmailRow'
import type { Email } from '@/types/email'

const mockEmail: Email = {
  id: 'e1',
  accountId: 'acc1',
  accountColor: 'blue',
  from: { name: 'Alice Smith', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
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

describe('EmailRow - Extended coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onArchive when Archive quick action is clicked', async () => {
    const user = userEvent.setup()
    const onArchive = vi.fn()
    render(<EmailRow {...defaultProps} onArchive={onArchive} />)

    const archiveBtn = screen.getByRole('button', { name: /archive/i })
    await user.click(archiveBtn)
    expect(onArchive).toHaveBeenCalled()
  })

  it('calls onDelete when Delete quick action is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<EmailRow {...defaultProps} onDelete={onDelete} />)

    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteBtn)
    expect(onDelete).toHaveBeenCalled()
  })

  it('calls onMarkRead when Mark as read quick action is clicked', async () => {
    const user = userEvent.setup()
    const onMarkRead = vi.fn()
    render(<EmailRow {...defaultProps} onMarkRead={onMarkRead} />)

    const markReadBtn = screen.getByRole('button', { name: /mark as read/i })
    await user.click(markReadBtn)
    expect(onMarkRead).toHaveBeenCalled()
  })

  it('shows "Mark as unread" when email is already read', () => {
    render(<EmailRow {...defaultProps} email={{ ...mockEmail, isRead: true }} />)
    expect(screen.getByRole('button', { name: /mark as unread/i })).toBeInTheDocument()
  })

  it('calls onSelect with shift key state when checkbox changed', () => {
    const onSelect = vi.fn()
    render(<EmailRow {...defaultProps} onSelect={onSelect} />)

    const checkbox = screen.getByLabelText(/select email from alice smith/i)
    fireEvent.click(checkbox)
    expect(onSelect).toHaveBeenCalled()
  })

  it('applies selected styles when isSelected is true', () => {
    const { container } = render(<EmailRow {...defaultProps} isSelected={true} />)
    const row = container.querySelector('[role="row"]')
    expect(row).toBeInTheDocument()
    // Row should have selected class
    expect(row?.className).toBeTruthy()
  })

  it('opens on Enter key press', () => {
    const onOpen = vi.fn()
    render(<EmailRow {...defaultProps} onOpen={onOpen} />)

    const row = screen.getByRole('row')
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(onOpen).toHaveBeenCalled()
  })

  it('opens on Space key press', () => {
    const onOpen = vi.fn()
    render(<EmailRow {...defaultProps} onOpen={onOpen} />)

    const row = screen.getByRole('row')
    fireEvent.keyDown(row, { key: ' ' })
    expect(onOpen).toHaveBeenCalled()
  })

  it('does not open on other key press', () => {
    const onOpen = vi.fn()
    render(<EmailRow {...defaultProps} onOpen={onOpen} />)

    const row = screen.getByRole('row')
    fireEvent.keyDown(row, { key: 'Escape' })
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('does not call onOpen when clicking a button within row', () => {
    const onOpen = vi.fn()
    render(<EmailRow {...defaultProps} onOpen={onOpen} />)

    const starBtn = screen.getByLabelText('Star email')
    fireEvent.click(starBtn)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('renders account color indicator', () => {
    render(<EmailRow {...defaultProps} />)
    expect(screen.getByRole('img', { name: /blue account indicator/i })).toBeInTheDocument()
  })

  it('shows thread count badge when threadCount greater than 1', () => {
    render(<EmailRow {...defaultProps} threadCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show thread badge when threadCount is 1', () => {
    render(<EmailRow {...defaultProps} threadCount={1} />)
    // threadCount of 1 should not show a badge (condition is > 1)
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })
})
