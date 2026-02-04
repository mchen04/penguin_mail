import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders with aria-label', () => {
    render(<Checkbox label="Accept terms" onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument()
  })

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Checkbox label="Toggle" onChange={handleChange} />)

    await user.click(screen.getByRole('checkbox'))
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('is checked when checked prop is true', () => {
    render(<Checkbox label="Checked" checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('is unchecked when checked prop is false', () => {
    render(<Checkbox label="Unchecked" checked={false} onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox label="Disabled" disabled onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Checkbox label="Disabled" disabled onChange={handleChange} />)

    await user.click(screen.getByRole('checkbox'))
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('accepts custom id', () => {
    render(<Checkbox label="With ID" id="custom-checkbox" onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'custom-checkbox')
  })

  it('applies custom className', () => {
    render(<Checkbox label="Custom" className="custom-class" onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-class')
  })
})
