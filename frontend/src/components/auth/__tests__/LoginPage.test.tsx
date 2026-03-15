import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'

const mockLogin = vi.fn()

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    login: mockLogin,
    error: null,
    isLoading: false,
  })),
}))

import { LoginPage } from '../LoginPage'
import { useAuth } from '@/context/AuthContext'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ login: mockLogin, error: null, isLoading: false })
  })

  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('Penguin Mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('disables button when fields are empty', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })

  it('enables button when fields are filled', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  })

  it('calls login on form submit', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('displays error message when login fails', () => {
    mockUseAuth.mockReturnValue({ login: mockLogin, error: 'Invalid credentials', isLoading: false })
    render(<LoginPage />)
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('shows loading text and disables button while signing in', () => {
    mockUseAuth.mockReturnValue({ login: mockLogin, error: null, isLoading: true })
    render(<LoginPage />)
    const button = screen.getByRole('button', { name: 'Signing in...' })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })
})
