import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('renders with accessible label', () => {
    render(<IconButton icon="star" label="Star email" onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Star email' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<IconButton icon="archive" label="Archive" onClick={handleClick} />)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<IconButton icon="trash" label="Delete" disabled onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows title on hover', () => {
    render(<IconButton icon="star" label="Star email" onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Star email')
  })

  it('applies custom className', () => {
    render(<IconButton icon="star" label="Star" className="custom-class" onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('applies small size class', () => {
    render(<IconButton icon="star" label="Star" size="small" onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('small')
  })

  it('applies large size class', () => {
    render(<IconButton icon="star" label="Star" size="large" onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('large')
  })

  it('renders the icon', () => {
    render(<IconButton icon="star" label="Star" onClick={() => {}} />)
    // The icon should be an SVG within the button
    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })
})
