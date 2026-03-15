import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { BulkActions } from '../BulkActions'

const defaultProps = {
  hasSelection: true,
  onArchive: vi.fn(),
  onDelete: vi.fn(),
  onMarkRead: vi.fn(),
  onMarkAsSpam: vi.fn(),
  onMoveToFolder: vi.fn(),
  onSnooze: vi.fn(),
}

function renderBulk(overrides = {}) {
  return render(<BulkActions {...defaultProps} {...overrides} />)
}

describe('BulkActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders action buttons when hasSelection is true', () => {
    renderBulk()
    expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as read' })).toBeInTheDocument()
  })

  it('disables buttons when hasSelection is false', () => {
    renderBulk({ hasSelection: false })
    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled()
  })

  it('calls onArchive when archive button is clicked', async () => {
    renderBulk()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Archive' }))

    expect(defaultProps.onArchive).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', async () => {
    renderBulk()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
  })

  it('calls onMarkRead when mark as read button is clicked', async () => {
    renderBulk()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Mark as read' }))

    expect(defaultProps.onMarkRead).toHaveBeenCalledTimes(1)
  })

  it('hides archive button when in trash folder', () => {
    renderBulk({ isTrash: true })
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })
})
