import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { SettingsModal } from '../SettingsModal/SettingsModal'

describe('SettingsModal', () => {
  it('renders when open', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<SettingsModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByText('General')).not.toBeInTheDocument()
  })

  it('shows tab navigation', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('shows appearance section by default', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />)
    // General tab should be active and show theme-related controls
    expect(screen.getByText(/theme/i)).toBeInTheDocument()
  })
})
