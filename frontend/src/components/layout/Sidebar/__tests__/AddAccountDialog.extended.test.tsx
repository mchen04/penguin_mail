/**
 * Extended tests for AddAccountDialog — covers provider selection, auto-detect from email domain,
 * custom SMTP/IMAP fields, password visibility toggle, test connection flow, and app-password hints.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AddAccountDialog } from '../AddAccountDialog'
import { createMockRepositories } from '@/test/mock-repositories'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
}

function renderDialog(overrides = {}, repos = createMockRepositories()) {
  return render(<AddAccountDialog {...defaultProps} {...overrides} />, { repos })
}

describe('AddAccountDialog — Provider selection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the email provider select with all options', () => {
    renderDialog()
    const select = screen.getByLabelText(/email provider/i) as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select.options).toHaveLength(8)
  })

  it('defaults to Gmail provider', () => {
    renderDialog()
    const select = screen.getByLabelText(/email provider/i) as HTMLSelectElement
    expect(select.value).toBe('gmail')
  })

  it('allows changing provider to Outlook', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'outlook')

    const select = screen.getByLabelText(/email provider/i) as HTMLSelectElement
    expect(select.value).toBe('outlook')
  })

  it('submits with selected provider', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog({ onSubmit })

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com')
    await user.type(screen.getByLabelText(/account name/i), 'Work')
    await user.type(screen.getByLabelText(/app password/i), 'secret123')
    await user.selectOptions(screen.getByLabelText(/email provider/i), 'zoho')

    await user.click(screen.getByRole('button', { name: /add account/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'zoho' })
      )
    })
  })
})

describe('AddAccountDialog — Auto-detect provider from email domain', () => {
  beforeEach(() => vi.clearAllMocks())

  it('auto-detects Gmail when email has @gmail.com', async () => {
    const user = userEvent.setup()
    renderDialog()

    // Switch away from gmail first
    await user.selectOptions(screen.getByLabelText(/email provider/i), 'outlook')

    await user.type(screen.getByLabelText(/email address/i), 'user@gmail.com')

    const select = screen.getByLabelText(/email provider/i) as HTMLSelectElement
    expect(select.value).toBe('gmail')
  })

  it('auto-detects Yahoo from @ymail.com', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText(/email address/i), 'user@ymail.com')

    const select = screen.getByLabelText(/email provider/i) as HTMLSelectElement
    expect(select.value).toBe('yahoo')
  })

  it('auto-detects Outlook from @hotmail.com', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText(/email address/i), 'user@hotmail.com')

    const select = screen.getByLabelText(/email provider/i) as HTMLSelectElement
    expect(select.value).toBe('outlook')
  })

  it('does not change provider for unknown domain', async () => {
    const user = userEvent.setup()
    renderDialog()

    // Default is gmail, typing unknown domain should not change it
    await user.type(screen.getByLabelText(/email address/i), 'user@unknowndomain.xyz')

    const select = screen.getByLabelText(/email provider/i) as HTMLSelectElement
    expect(select.value).toBe('gmail')
  })
})

describe('AddAccountDialog — Custom provider SMTP/IMAP fields', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not show SMTP/IMAP fields for non-custom provider', () => {
    renderDialog()
    expect(screen.queryByLabelText(/smtp host/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/imap host/i)).not.toBeInTheDocument()
  })

  it('shows SMTP and IMAP fields when custom provider is selected', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'custom')

    expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument()
    expect(document.getElementById('account-smtp-port')).toBeInTheDocument()
    expect(document.getElementById('account-smtp-security')).toBeInTheDocument()
    expect(screen.getByLabelText(/imap host/i)).toBeInTheDocument()
    expect(document.getElementById('account-imap-port')).toBeInTheDocument()
    expect(document.getElementById('account-imap-security')).toBeInTheDocument()
  })

  it('shows validation error when custom provider hosts are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog({ onSubmit })

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'custom')
    await user.type(screen.getByLabelText(/email address/i), 'user@custom.com')
    await user.type(screen.getByLabelText(/account name/i), 'Custom')
    await user.type(screen.getByLabelText(/app password/i), 'secret')

    await user.click(screen.getByRole('button', { name: /add account/i }))

    await waitFor(() => {
      expect(screen.getByText(/smtp and imap hosts are required/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits custom server settings correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog({ onSubmit })

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'custom')
    await user.type(screen.getByLabelText(/email address/i), 'user@custom.com')
    await user.type(screen.getByLabelText(/account name/i), 'Custom Account')
    await user.type(screen.getByLabelText(/app password/i), 'secret')
    await user.type(screen.getByLabelText(/smtp host/i), 'smtp.custom.com')
    // Clear default port and type new one
    const smtpPortInput = document.getElementById('account-smtp-port') as HTMLInputElement
    await user.clear(smtpPortInput)
    await user.type(smtpPortInput, '465')
    await user.type(screen.getByLabelText(/imap host/i), 'imap.custom.com')

    await user.click(screen.getByRole('button', { name: /add account/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'custom',
          smtp_host: 'smtp.custom.com',
          smtp_port: 465,
          imap_host: 'imap.custom.com',
          imap_port: 993,
          imap_security: 'ssl',
        })
      )
    })
  })
})

describe('AddAccountDialog — Password field', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders password field as type password by default', () => {
    renderDialog()
    const input = screen.getByLabelText(/app password/i)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles password visibility when Show/Hide is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    const input = screen.getByLabelText(/app password/i)
    expect(input).toHaveAttribute('type', 'password')

    // Click "Show"
    await user.click(screen.getByText('Show'))
    expect(input).toHaveAttribute('type', 'text')

    // Click "Hide"
    await user.click(screen.getByText('Hide'))
    expect(input).toHaveAttribute('type', 'password')
  })
})

describe('AddAccountDialog — App password hints', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Gmail app password hint when Gmail is selected', () => {
    renderDialog()
    expect(screen.getByText(/gmail requires an app password/i)).toBeInTheDocument()
    expect(screen.getByText(/how to create one/i)).toHaveAttribute(
      'href',
      'https://myaccount.google.com/apppasswords'
    )
  })

  it('shows Yahoo hint when Yahoo is selected', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'yahoo')

    expect(screen.getByText(/yahoo requires an app password/i)).toBeInTheDocument()
  })

  it('shows iCloud hint when iCloud is selected', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'icloud')

    expect(screen.getByText(/icloud requires an app-specific password/i)).toBeInTheDocument()
  })

  it('does not show hint for Outlook', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'outlook')

    expect(screen.queryByText(/how to create one/i)).not.toBeInTheDocument()
  })
})

describe('AddAccountDialog — Test connection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders Test Connection button', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /test connection/i })).toBeInTheDocument()
  })

  it('shows error when testing with empty email/password', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /test connection/i }))

    await waitFor(() => {
      expect(screen.getByText(/email and app password are required/i)).toBeInTheDocument()
    })
  })

  it('shows success message when both SMTP and IMAP pass', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.accounts.testConnection = vi.fn().mockResolvedValue({
      success: true,
      data: { smtp: true, imap: true, smtp_error: '', imap_error: '' },
    })
    renderDialog({}, repos)

    await user.type(screen.getByLabelText(/email address/i), 'user@gmail.com')
    await user.type(screen.getByLabelText(/app password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /test connection/i }))

    await waitFor(() => {
      expect(screen.getByText(/connection successful/i)).toBeInTheDocument()
    })
  })

  it('shows SMTP error when SMTP fails', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.accounts.testConnection = vi.fn().mockResolvedValue({
      success: true,
      data: { smtp: false, imap: true, smtp_error: 'Connection refused', imap_error: '' },
    })
    renderDialog({}, repos)

    await user.type(screen.getByLabelText(/email address/i), 'user@gmail.com')
    await user.type(screen.getByLabelText(/app password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /test connection/i }))

    await waitFor(() => {
      expect(screen.getByText(/SMTP: Connection refused/)).toBeInTheDocument()
    })
  })

  it('shows auth hint when credentials fail for Gmail', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.accounts.testConnection = vi.fn().mockResolvedValue({
      success: true,
      data: { smtp: false, imap: false, smtp_error: 'Authentication failed', imap_error: 'Bad credentials' },
    })
    renderDialog({}, repos)

    await user.type(screen.getByLabelText(/email address/i), 'user@gmail.com')
    await user.type(screen.getByLabelText(/app password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /test connection/i }))

    await waitFor(() => {
      expect(screen.getByText(/use an app password instead/i)).toBeInTheDocument()
    })
  })

  it('shows generic error when testConnection returns failure', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.accounts.testConnection = vi.fn().mockResolvedValue({
      success: false,
      error: 'Network error',
    })
    renderDialog({}, repos)

    await user.type(screen.getByLabelText(/email address/i), 'user@gmail.com')
    await user.type(screen.getByLabelText(/app password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /test connection/i }))

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('passes custom server fields when testing with custom provider', async () => {
    const user = userEvent.setup()
    const repos = createMockRepositories()
    repos.accounts.testConnection = vi.fn().mockResolvedValue({
      success: true,
      data: { smtp: true, imap: true, smtp_error: '', imap_error: '' },
    })
    renderDialog({}, repos)

    await user.selectOptions(screen.getByLabelText(/email provider/i), 'custom')
    await user.type(screen.getByLabelText(/email address/i), 'user@custom.com')
    await user.type(screen.getByLabelText(/app password/i), 'secret')
    await user.type(screen.getByLabelText(/smtp host/i), 'smtp.custom.com')
    await user.type(screen.getByLabelText(/imap host/i), 'imap.custom.com')

    await user.click(screen.getByRole('button', { name: /test connection/i }))

    await waitFor(() => {
      expect(repos.accounts.testConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'custom',
          smtp_host: 'smtp.custom.com',
          imap_host: 'imap.custom.com',
        })
      )
    })
  })
})

describe('AddAccountDialog — Overlay and keyboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({ onClose })

    // The overlay is the presentation role element
    const overlay = screen.getByRole('presentation')
    await user.click(overlay)

    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose on Escape while submitting', async () => {
    // Use a never-resolving promise to keep isSubmitting true
    const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}))
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onSubmit, onClose })

    await user.type(screen.getByLabelText(/email address/i), 'user@gmail.com')
    await user.type(screen.getByLabelText(/account name/i), 'Work')
    await user.type(screen.getByLabelText(/app password/i), 'secret')

    // Start submission
    await user.click(screen.getByRole('button', { name: /add account/i }))

    // Clear previous onClose calls (from any earlier interactions)
    onClose.mockClear()

    // Now press Escape — should not close while submitting
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })
})
