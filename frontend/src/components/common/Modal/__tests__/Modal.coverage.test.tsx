/**
 * Additional coverage for Modal — focus trap (Tab/Shift+Tab wrapping) and size variants.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Modal } from '../Modal'

describe('Modal — Focus trap', () => {
  it('wraps focus from last to first element on Tab', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Focus Test">
        <button>First</button>
        <button>Last</button>
      </Modal>
    )

    const lastButton = screen.getByText('Last')
    lastButton.focus()

    // Pressing Tab while on last focusable element should wrap to first
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('wraps focus from first to last element on Shift+Tab', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Focus Test">
        <button>First</button>
        <button>Last</button>
      </Modal>
    )

    // The first focusable element in the modal is actually the Close button
    // Focus the Close button (first focusable)
    const closeButton = screen.getByRole('button', { name: /close/i })
    closeButton.focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('does not prevent default for non-Tab keys', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Focus Test">
        <button>Only</button>
      </Modal>
    )

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)

    expect(preventDefaultSpy).not.toHaveBeenCalled()
  })
})

describe('Modal — Size variants', () => {
  it('renders with small size class', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Small" size="small">
        <p>Content</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/small/)
  })

  it('renders with large size class', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Large" size="large">
        <p>Content</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/large/)
  })
})
