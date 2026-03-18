/**
 * Additional coverage tests for Toolbar — sync button, empty trash/spam,
 * and folder-specific branch conditions.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Toolbar } from '../Toolbar'
import { createMockRepositories } from '@/test/mock-repositories'

const defaultProps = {
  selectedCount: 0,
  totalCount: 10,
  onSelectAll: vi.fn(),
  allSelected: false,
  onArchive: vi.fn(),
  onDelete: vi.fn(),
  onMarkRead: vi.fn(),
  currentFolder: 'inbox' as const,
}

describe('Toolbar — Sync button', () => {
  it('renders sync button', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /sync emails/i })).toBeInTheDocument()
  })

  it('calls sync on repository when sync button is clicked', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.accounts.getAll = vi.fn().mockResolvedValue([
      { id: 'acc-1', name: 'Test', email: 'test@example.com', isDefault: true },
    ])
    render(<Toolbar {...defaultProps} />, { repos })

    await user.click(screen.getByRole('button', { name: /sync emails/i }))

    await waitFor(() => {
      expect(repos.accounts.sync).toHaveBeenCalled()
    })
  })
})

describe('Toolbar — Empty Trash', () => {
  it('shows Empty Trash button when in trash folder with emails', () => {
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={5} />)
    expect(screen.getByText(/empty trash/i)).toBeInTheDocument()
  })

  it('does not show Empty Trash button when trash is empty', () => {
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={0} />)
    expect(screen.queryByText(/empty trash/i)).not.toBeInTheDocument()
  })

  it('does not show Empty Trash in inbox', () => {
    render(<Toolbar {...defaultProps} currentFolder="inbox" totalCount={5} />)
    expect(screen.queryByText(/empty trash/i)).not.toBeInTheDocument()
  })

  it('shows confirmation dialog and calls onEmptyTrash', async () => {
    const user = userEvent.setup()
    const onEmptyTrash = vi.fn()
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={3} onEmptyTrash={onEmptyTrash} />)

    // Click Empty Trash to show confirm dialog
    await user.click(screen.getByText(/empty trash/i))

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/permanently delete all 3 emails in the trash/i)).toBeInTheDocument()
    })

    // Confirm — the confirm dialog has its own "Empty Trash" button
    const emptyTrashButtons = screen.getAllByRole('button', { name: /empty trash/i })
    await user.click(emptyTrashButtons[emptyTrashButtons.length - 1])

    expect(onEmptyTrash).toHaveBeenCalled()
  })
})

describe('Toolbar — Empty Spam', () => {
  it('shows Empty Spam button when in spam folder with emails', () => {
    render(<Toolbar {...defaultProps} currentFolder="spam" totalCount={5} />)
    expect(screen.getByText(/empty spam/i)).toBeInTheDocument()
  })

  it('does not show Empty Spam button when spam is empty', () => {
    render(<Toolbar {...defaultProps} currentFolder="spam" totalCount={0} />)
    expect(screen.queryByText(/empty spam/i)).not.toBeInTheDocument()
  })

  it('shows confirmation dialog and calls onEmptySpam', async () => {
    const user = userEvent.setup()
    const onEmptySpam = vi.fn()
    render(<Toolbar {...defaultProps} currentFolder="spam" totalCount={2} onEmptySpam={onEmptySpam} />)

    await user.click(screen.getByText(/empty spam/i))

    await waitFor(() => {
      expect(screen.getByText(/permanently delete all 2 emails in spam/i)).toBeInTheDocument()
    })

    const emptySpamButtons = screen.getAllByRole('button', { name: /empty spam/i })
    await user.click(emptySpamButtons[emptySpamButtons.length - 1])

    expect(onEmptySpam).toHaveBeenCalled()
  })
})

describe('Toolbar — Select all disabled', () => {
  it('disables select all checkbox when totalCount is 0', () => {
    render(<Toolbar {...defaultProps} totalCount={0} />)
    expect(screen.getByLabelText(/select all/i)).toBeDisabled()
  })
})

describe('Toolbar — Singular email in confirmation', () => {
  it('uses singular "email" when totalCount is 1 for trash', async () => {
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} currentFolder="trash" totalCount={1} onEmptyTrash={vi.fn()} />)

    await user.click(screen.getByText(/empty trash/i))

    await waitFor(() => {
      // Should say "1 email" not "1 emails"
      expect(screen.getByText(/permanently delete all 1 email in the trash/i)).toBeInTheDocument()
    })
  })
})
