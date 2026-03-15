import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Icon } from '../Icon'

describe('Icon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Icon name="star" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies custom size', () => {
    const { container } = render(<Icon name="star" size={32} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
  })

  it('applies className', () => {
    const { container } = render(<Icon name="star" className="custom-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom-class')
  })

  it('renders different icons', () => {
    const { container: c1 } = render(<Icon name="star" />)
    const { container: c2 } = render(<Icon name="trash" />)
    // Both should render SVGs but with different paths
    expect(c1.querySelector('svg')).toBeInTheDocument()
    expect(c2.querySelector('svg')).toBeInTheDocument()
  })
})
