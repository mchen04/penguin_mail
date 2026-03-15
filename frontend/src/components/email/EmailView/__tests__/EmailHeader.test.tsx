import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { EmailHeader } from '../EmailHeader'

const mockEmail = {
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

function renderHeader(overrides = {}) {
  return render(<EmailHeader {...defaultProps} {...overrides} />)
}

describe('EmailHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sender name and email', () => {
    renderHeader()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText(/john@example\.com/)).toBeInTheDocument()
  })

  it('renders the email subject', () => {
    renderHeader()
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
  })

  it('calls onReply when reply button is clicked', async () => {
    renderHeader()
    const user = userEvent.setup()

    const replyBtn = screen.getByRole('button', { name: 'Reply' })
    await user.click(replyBtn)

    expect(defaultProps.onReply).toHaveBeenCalledTimes(1)
  })

  it('calls onForward when forward button is clicked', async () => {
    renderHeader()
    const user = userEvent.setup()

    const forwardBtn = screen.getByRole('button', { name: 'Forward' })
    await user.click(forwardBtn)

    expect(defaultProps.onForward).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleStar when star button is clicked', async () => {
    renderHeader()
    const user = userEvent.setup()

    const starBtn = screen.getByRole('button', { name: 'Star' })
    await user.click(starBtn)

    expect(defaultProps.onToggleStar).toHaveBeenCalledTimes(1)
  })

  it('shows recipients', () => {
    renderHeader()
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
  })
})
