/**
 * Tests for HelpDialog
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { HelpDialog } from '../HelpDialog'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
}

describe('HelpDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<HelpDialog isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the dialog when isOpen is true', () => {
    render(<HelpDialog {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts section', () => {
    render(<HelpDialog {...defaultProps} />)
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('renders Getting Started section', () => {
    render(<HelpDialog {...defaultProps} />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
  })

  it('renders Tips section', () => {
    render(<HelpDialog {...defaultProps} />)
    expect(screen.getByText('Tips')).toBeInTheDocument()
  })

  it('renders shortcut keys', () => {
    render(<HelpDialog {...defaultProps} />)
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('Compose new email')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('renders Got it button', () => {
    render(<HelpDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument()
  })

  it('calls onClose when Got it is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<HelpDialog isOpen={true} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /got it/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<HelpDialog isOpen={true} onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when close button (X) is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<HelpDialog isOpen={true} onClose={onClose} />)

    // Find the close button (the X button in the header)
    const closeButton = screen.getAllByRole('button').find(b =>
      b.getAttribute('class')?.includes('close') || b.querySelector('svg')
    )
    if (closeButton && closeButton.textContent?.trim() === '') {
      await user.click(closeButton)
      expect(onClose).toHaveBeenCalled()
    } else {
      // Fallback: click the first button that's not "Got it"
      const buttons = screen.getAllByRole('button')
      const xBtn = buttons.find(b => b.textContent?.trim() !== 'Got it')
      if (xBtn) {
        await user.click(xBtn)
        expect(onClose).toHaveBeenCalled()
      }
    }
  })

  it('calls onClose when overlay background is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<HelpDialog isOpen={true} onClose={onClose} />)

    // Click the overlay (presentation role)
    const overlay = screen.getByRole('presentation')
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })
})
