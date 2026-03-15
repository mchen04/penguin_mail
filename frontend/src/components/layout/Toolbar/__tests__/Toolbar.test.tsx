import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { render, screen } from '@/test/test-utils'
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
  currentFolder: 'inbox' as const,
}

describe('Toolbar', () => {
  it('renders compose button', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText(/compose/i)).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders select all checkbox', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByLabelText(/select all/i)).toBeInTheDocument()
  })

  it('shows settings button', () => {
    render(<Toolbar {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('calls onSelectAll when select-all checkbox is clicked', async () => {
    const onSelectAll = vi.fn()
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} onSelectAll={onSelectAll} />)
    await user.click(screen.getByLabelText(/select all/i))
    expect(onSelectAll).toHaveBeenCalledWith(true)
  })

  it('shows bulk action buttons when emails are selected', () => {
    render(<Toolbar {...defaultProps} selectedCount={2} />)
    expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('calls onArchive when archive button is clicked', async () => {
    const onArchive = vi.fn()
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} selectedCount={1} onArchive={onArchive} />)
    await user.click(screen.getByRole('button', { name: /archive/i }))
    expect(onArchive).toHaveBeenCalledTimes(1)
  })

  it('calls onMarkRead when mark-read button is clicked', async () => {
    const onMarkRead = vi.fn()
    const user = userEvent.setup()
    render(<Toolbar {...defaultProps} selectedCount={1} onMarkRead={onMarkRead} />)
    await user.click(screen.getByRole('button', { name: /mark.*read/i }))
    expect(onMarkRead).toHaveBeenCalledTimes(1)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Toolbar {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
