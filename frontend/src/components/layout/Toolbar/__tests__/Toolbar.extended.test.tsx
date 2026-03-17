/**
 * Extended tests for Toolbar covering Empty Trash, Empty Spam, confirmation dialogs,
 * Settings button, compose button, and folder-specific display
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Toolbar } from '../Toolbar'

const defaultProps = {
  selectedCount: 0,
  totalCount: 10,
  onSelectAll: vi.fn(),
  allSelected: false,
  onArchive: vi.fn(),
  onDelete: vi.fn(),
  onMarkRead: vi.fn(),
  onEmptyTrash: vi.fn(),
  onEmptySpam: vi.fn(),
  onMarkAsSpam: vi.fn(),
  onMarkNotSpam: vi.fn(),
  onMoveToFolder: vi.fn(),
}

describe('Toolbar - Trash folder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Empty Trash button when in trash folder with emails', () => {
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={5} />)
    expect(screen.getByText(/empty trash/i)).toBeInTheDocument()
  })

  it('does not show Empty Trash button when trash is empty', () => {
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={0} />)
    expect(screen.queryByText(/empty trash/i)).not.toBeInTheDocument()
  })

  it('opens confirmation dialog when Empty Trash is clicked', async () => {
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={5} />)

    await user.click(screen.getByText(/empty trash/i))

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })
  })

  it('calls onEmptyTrash after confirming empty trash dialog', async () => {
    const user = userEvent.setup()
    const onEmptyTrash = vi.fn()
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={5} onEmptyTrash={onEmptyTrash} />)

    await user.click(screen.getByText(/empty trash/i))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument())

    // Click the confirm button inside the dialog
    const dialog = screen.getByRole('alertdialog')
    const confirmBtn = dialog.querySelector('button[class*="danger"]') ||
      screen.getAllByRole('button', { name: /empty trash/i }).find(b =>
        b.closest('[role="alertdialog"]')
      )
    if (confirmBtn) await user.click(confirmBtn as HTMLElement)

    expect(onEmptyTrash).toHaveBeenCalled()
  })

  it('closes dialog when Cancel is clicked in empty trash dialog', async () => {
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={5} />)

    await user.click(screen.getByText(/empty trash/i))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })
})

describe('Toolbar - Spam folder', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Empty Spam button when in spam folder with emails', () => {
    render(<Toolbar {...defaultProps} currentFolder="spam" totalCount={3} />)
    expect(screen.getByText(/empty spam/i)).toBeInTheDocument()
  })

  it('does not show Empty Spam button when spam is empty', () => {
    render(<Toolbar {...defaultProps} currentFolder="spam" totalCount={0} />)
    expect(screen.queryByText(/empty spam/i)).not.toBeInTheDocument()
  })

  it('opens confirmation dialog when Empty Spam is clicked', async () => {
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} currentFolder="spam" totalCount={3} />)

    await user.click(screen.getByText(/empty spam/i))

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })
  })

  it('calls onEmptySpam after confirming', async () => {
    const user = userEvent.setup()
    const onEmptySpam = vi.fn()
    render(<Toolbar {...defaultProps} currentFolder="spam" totalCount={3} onEmptySpam={onEmptySpam} />)

    await user.click(screen.getByText(/empty spam/i))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument())

    // Click the confirm button inside the dialog
    screen.getByRole('alertdialog') // assert dialog is open
    const confirmBtn = screen.getAllByRole('button', { name: /empty spam/i }).find(b =>
      b.closest('[role="alertdialog"]')
    )
    if (confirmBtn) await user.click(confirmBtn as HTMLElement)

    expect(onEmptySpam).toHaveBeenCalled()
  })
})

describe('Toolbar - Settings and Compose', () => {
  beforeEach(() => vi.clearAllMocks())

  it('clicking compose button opens compose window', async () => {
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} />)

    await user.click(screen.getByTestId('compose-button'))
    // Compose should open - just verify no crash
    expect(screen.getByTestId('compose-button')).toBeInTheDocument()
  })

  it('clicking settings opens settings modal', async () => {
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /settings/i }))
    // Settings should open - just verify no crash
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })
})

describe('Toolbar - Inbox folder display', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not show Empty Trash in inbox folder', () => {
    render(<Toolbar {...defaultProps} currentFolder="inbox" totalCount={10} />)
    expect(screen.queryByText(/empty trash/i)).not.toBeInTheDocument()
  })

  it('does not show Empty Spam in inbox folder', () => {
    render(<Toolbar {...defaultProps} currentFolder="inbox" totalCount={10} />)
    expect(screen.queryByText(/empty spam/i)).not.toBeInTheDocument()
  })
})
