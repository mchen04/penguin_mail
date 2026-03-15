import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateTimePicker } from '../DateTimePicker'

const defaultProps = {
  title: 'Schedule Send',
  confirmButtonText: 'Schedule',
  presets: [
    { label: 'Tomorrow morning', sublabel: 'Tue, 8:00 AM', date: new Date('2099-01-02T08:00:00') },
    { label: 'Next week', sublabel: 'Mon, 8:00 AM', date: new Date('2099-01-07T08:00:00') },
  ],
  onSelect: vi.fn(),
  onCancel: vi.fn(),
}

describe('DateTimePicker', () => {
  it('renders title', () => {
    render(<DateTimePicker {...defaultProps} />)
    expect(screen.getByText('Schedule Send')).toBeInTheDocument()
  })

  it('renders preset buttons', () => {
    render(<DateTimePicker {...defaultProps} />)
    expect(screen.getByText('Tomorrow morning')).toBeInTheDocument()
    expect(screen.getByText('Next week')).toBeInTheDocument()
  })

  it('calls onSelect when preset is clicked', () => {
    const onSelect = vi.fn()
    render(<DateTimePicker {...defaultProps} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Tomorrow morning'))
    expect(onSelect).toHaveBeenCalled()
  })

  it('shows custom date/time section', () => {
    render(<DateTimePicker {...defaultProps} />)
    // Should have a way to pick custom date
    const customBtn = screen.getByText(/pick date|custom/i)
    fireEvent.click(customBtn)
    // After clicking, should show date and time inputs
    expect(screen.getByDisplayValue(/09:00/)).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<DateTimePicker {...defaultProps} onCancel={onCancel} />)
    const cancelBtn = screen.getByText(/cancel/i)
    fireEvent.click(cancelBtn)
    expect(onCancel).toHaveBeenCalled()
  })
})
