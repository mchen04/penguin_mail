import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockRemoveToast = vi.fn()

vi.mock('@/context/ToastContext', () => ({
  useToast: vi.fn(() => ({
    toasts: [
      { id: '1', message: 'Success message', type: 'success' },
      { id: '2', message: 'Error message', type: 'error' },
    ],
    removeToast: mockRemoveToast,
  })),
}))

import { ToastContainer } from '../ToastContainer'
import { useToast } from '@/context/ToastContext'

const mockUseToast = useToast as ReturnType<typeof vi.fn>

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseToast.mockReturnValue({
      toasts: [
        { id: '1', message: 'Success message', type: 'success' },
        { id: '2', message: 'Error message', type: 'error' },
      ],
      removeToast: mockRemoveToast,
    })
  })

  it('renders toast messages', () => {
    render(<ToastContainer />)
    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('renders dismiss buttons', () => {
    render(<ToastContainer />)
    const dismissButtons = screen.getAllByLabelText('Dismiss notification')
    expect(dismissButtons).toHaveLength(2)
  })

  it('calls removeToast on dismiss', () => {
    render(<ToastContainer />)
    const dismissButtons = screen.getAllByLabelText('Dismiss notification')
    fireEvent.click(dismissButtons[0])
    expect(mockRemoveToast).toHaveBeenCalledWith('1')
  })

  it('has notifications region role', () => {
    render(<ToastContainer />)
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('renders nothing when no toasts', () => {
    mockUseToast.mockReturnValue({ toasts: [], removeToast: mockRemoveToast })
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders action button when toast has action (branch 1 arm 1)', async () => {
    const actionClick = vi.fn()
    mockUseToast.mockReturnValue({
      toasts: [
        { id: '3', message: 'Undo action', type: 'info', action: { label: 'Undo', onClick: actionClick } },
      ],
      removeToast: mockRemoveToast,
    })
    render(<ToastContainer />)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })
})
