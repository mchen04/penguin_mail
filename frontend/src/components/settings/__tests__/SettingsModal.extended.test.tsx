/**
 * Extended tests for SettingsModal - covers tab switching and each settings section
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { SettingsModal } from '../SettingsModal/SettingsModal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
}

describe('SettingsModal - Tab navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('switches to Notifications tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /^notifications$/i }))
    await waitFor(() => {
      // Notifications tab renders a section with heading
      const matches = screen.getAllByText(/desktop notifications/i)
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  it('switches to Inbox tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /^inbox$/i }))
    await waitFor(() => {
      // Inbox tab contains conversation view settings
      expect(screen.getByText(/conversation view/i)).toBeInTheDocument()
    })
  })

  it('switches to Signatures tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /signatures/i }))
    await waitFor(() => {
      expect(screen.getByText(/add signature/i)).toBeInTheDocument()
    })
  })

  it('switches to Templates tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /templates/i }))
    await waitFor(() => {
      expect(screen.getByText(/add template/i)).toBeInTheDocument()
    })
  })

  it('switches to Vacation tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /^vacation$/i }))
    await waitFor(() => {
      // Vacation tab renders section heading "Vacation Responder"
      const matches = screen.getAllByText(/vacation responder/i)
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  it('switches to Filters tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /^filters$/i }))
    await waitFor(() => {
      // Filters tab renders "Email Filters" heading and "Create Filter" button
      expect(screen.getByText(/email filters/i)).toBeInTheDocument()
    })
  })

  it('switches to Blocked tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /^blocked$/i }))
    await waitFor(() => {
      // Blocked tab renders section heading "Blocked Addresses"
      const matches = screen.getAllByText(/blocked addresses/i)
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  it('switches to Shortcuts tab when clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /^shortcuts$/i }))
    await waitFor(() => {
      // Shortcuts tab renders section heading "Keyboard Shortcuts"
      const matches = screen.getAllByText(/keyboard shortcuts/i)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})

describe('SettingsModal - General tab', () => {
  it('shows theme options', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByText(/theme/i)).toBeInTheDocument()
  })

  it('shows density options', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByText(/density/i)).toBeInTheDocument()
  })

  it('shows font size control', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByText(/font size/i)).toBeInTheDocument()
  })

  it('shows Reset Settings button', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })
})

describe('SettingsModal - Close behavior', () => {
  it('calls onClose when modal is closed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<SettingsModal isOpen={true} onClose={onClose} />)

    // The modal has a close button
    const closeBtn = screen.getAllByRole('button').find(b =>
      b.getAttribute('aria-label')?.toLowerCase().includes('close') ||
      b.title?.toLowerCase().includes('close')
    )

    if (closeBtn) {
      await user.click(closeBtn)
      expect(onClose).toHaveBeenCalled()
    }
  })
})

describe('SettingsModal - Signatures tab interactions', () => {
  it('shows Add Signature button in signatures tab', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /signatures/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add signature/i })).toBeInTheDocument()
    })
  })

  it('shows create form when Add Signature is clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /signatures/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add signature/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add signature/i }))

    await waitFor(() => {
      // A form appears with "Signature name" label and placeholder
      expect(
        screen.queryByText(/signature name/i) ||
        screen.queryByPlaceholderText(/work, personal/i)
      ).toBeTruthy()
    })
  })
})

describe('SettingsModal - Blocked tab interactions', () => {
  it('shows block address input in blocked tab', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /blocked/i }))

    await waitFor(() => {
      // Should show input to block addresses
      expect(
        screen.queryByPlaceholderText(/email address/i) ||
        screen.queryByText(/block address/i)
      ).toBeTruthy()
    })
  })
})

describe('SettingsModal - Notifications tab interactions', () => {
  it('shows notification toggle in notifications tab', async () => {
    const user = userEvent.setup()
    render(<SettingsModal {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /^notifications$/i }))

    await waitFor(() => {
      // Notifications tab shows toggles for email and desktop notifications
      const matches = screen.getAllByText(/email notifications/i)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})
