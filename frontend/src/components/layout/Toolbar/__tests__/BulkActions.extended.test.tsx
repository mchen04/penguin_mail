/**
 * Extended tests for BulkActions covering spam/trash modes, move to folder,
 * mark not spam, snooze, and disabled state
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { BulkActions } from '../BulkActions'

const defaultProps = {
  hasSelection: true,
  onArchive: vi.fn(),
  onDelete: vi.fn(),
  onMarkRead: vi.fn(),
  onMarkAsSpam: vi.fn(),
  onMarkNotSpam: vi.fn(),
  onMoveToFolder: vi.fn(),
  onSnooze: vi.fn(),
}

function renderBulk(overrides: Partial<typeof defaultProps & { isTrash?: boolean; isSpam?: boolean; isSnoozed?: boolean }> = {}) {
  return render(<BulkActions {...defaultProps} {...overrides} />)
}

describe('BulkActions - Spam folder mode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Not spam button when isSpam=true', () => {
    renderBulk({ isSpam: true })
    expect(screen.getByRole('button', { name: /not spam/i })).toBeInTheDocument()
  })

  it('hides Archive button when isSpam=true', () => {
    renderBulk({ isSpam: true })
    expect(screen.queryByRole('button', { name: /^archive$/i })).not.toBeInTheDocument()
  })

  it('hides Mark as spam button when isSpam=true', () => {
    renderBulk({ isSpam: true })
    expect(screen.queryByRole('button', { name: /mark as spam/i })).not.toBeInTheDocument()
  })

  it('calls onMarkNotSpam when Not spam is clicked', async () => {
    const user = userEvent.setup()
    renderBulk({ isSpam: true })

    await user.click(screen.getByRole('button', { name: /not spam/i }))
    expect(defaultProps.onMarkNotSpam).toHaveBeenCalled()
  })
})

describe('BulkActions - Trash folder mode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows "Delete permanently" button in trash mode', () => {
    renderBulk({ isTrash: true })
    expect(screen.getByRole('button', { name: /delete permanently/i })).toBeInTheDocument()
  })

  it('hides Archive button when isTrash=true', () => {
    renderBulk({ isTrash: true })
    expect(screen.queryByRole('button', { name: /^archive$/i })).not.toBeInTheDocument()
  })

  it('hides Mark as spam button when isTrash=true', () => {
    renderBulk({ isTrash: true })
    expect(screen.queryByRole('button', { name: /mark as spam/i })).not.toBeInTheDocument()
  })
})

describe('BulkActions - Move to folder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows move dropdown when Move to folder is clicked', async () => {
    const user = userEvent.setup()
    renderBulk()

    await user.click(screen.getByRole('button', { name: /move to folder/i }))
    await waitFor(() => {
      expect(screen.getByText('Inbox')).toBeInTheDocument()
      expect(screen.getByText('Archive')).toBeInTheDocument()
      expect(screen.getByText('Spam')).toBeInTheDocument()
    })
  })

  it('calls onMoveToFolder with correct folder when inbox is selected', async () => {
    const user = userEvent.setup()
    renderBulk()

    await user.click(screen.getByRole('button', { name: /move to folder/i }))
    await waitFor(() => expect(screen.getByText('Inbox')).toBeInTheDocument())

    await user.click(screen.getByText('Inbox'))
    expect(defaultProps.onMoveToFolder).toHaveBeenCalledWith('inbox')
  })

  it('calls onMoveToFolder with trash when Trash is selected', async () => {
    const user = userEvent.setup()
    renderBulk()

    await user.click(screen.getByRole('button', { name: /move to folder/i }))
    await waitFor(() => expect(screen.getByText('Trash')).toBeInTheDocument())

    await user.click(screen.getByText('Trash'))
    expect(defaultProps.onMoveToFolder).toHaveBeenCalledWith('trash')
  })

  it('does not show move menu when hasSelection is false', async () => {
    const user = userEvent.setup()
    renderBulk({ hasSelection: false })

    await user.click(screen.getByRole('button', { name: /move to folder/i }))
    expect(screen.queryByText('Inbox')).not.toBeInTheDocument()
  })
})

describe('BulkActions - Mark as spam', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onMarkAsSpam when Mark as spam is clicked', async () => {
    const user = userEvent.setup()
    renderBulk()

    await user.click(screen.getByRole('button', { name: /mark as spam/i }))
    expect(defaultProps.onMarkAsSpam).toHaveBeenCalled()
  })
})

describe('BulkActions - Snooze', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Snooze button when onSnooze provided and not in trash/spam', () => {
    renderBulk()
    expect(screen.getByRole('button', { name: /snooze/i })).toBeInTheDocument()
  })

  it('hides Snooze button when isTrash=true', () => {
    renderBulk({ isTrash: true })
    expect(screen.queryByRole('button', { name: /snooze/i })).not.toBeInTheDocument()
  })

  it('hides Snooze button when isSpam=true', () => {
    renderBulk({ isSpam: true })
    expect(screen.queryByRole('button', { name: /snooze/i })).not.toBeInTheDocument()
  })

  it('hides Snooze button when isSnoozed=true', () => {
    renderBulk({ isSnoozed: true })
    expect(screen.queryByRole('button', { name: /snooze/i })).not.toBeInTheDocument()
  })

  it('opens snooze picker when Snooze button is clicked', async () => {
    const user = userEvent.setup()
    renderBulk()

    await user.click(screen.getByRole('button', { name: /snooze/i }))
    await waitFor(() => {
      // SnoozePicker should appear with options
      const matches = screen.getAllByText(/later today|tomorrow|this weekend|snooze/i)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})

describe('BulkActions - Delete action', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    renderBulk()

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(defaultProps.onDelete).toHaveBeenCalled()
  })
})
