import { vi } from 'vitest'
import { render, screen, userEvent } from '@/test/test-utils'
import { AdvancedSearch } from '../AdvancedSearch'

const defaultProps = {
  onSearch: vi.fn(),
}

function renderSearch(overrides = {}) {
  return render(<AdvancedSearch {...defaultProps} {...overrides} />)
}

describe('AdvancedSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the search bar', () => {
    renderSearch()
    expect(screen.getByLabelText('Search mail')).toBeInTheDocument()
  })

  it('expands advanced filters when filter button is clicked', async () => {
    renderSearch()
    const user = userEvent.setup()

    const filterBtn = screen.getByTitle('Advanced search')
    await user.click(filterBtn)

    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
    expect(screen.getByText('Subject')).toBeInTheDocument()
  })

  it('has attachment filter dropdown', async () => {
    renderSearch()
    const user = userEvent.setup()

    await user.click(screen.getByTitle('Advanced search'))

    expect(screen.getByText('Has attachment')).toBeInTheDocument()
  })

  it('calls onSearch when Apply button is clicked', async () => {
    renderSearch()
    const user = userEvent.setup()

    await user.click(screen.getByTitle('Advanced search'))
    await user.click(screen.getByText('Apply'))

    expect(defaultProps.onSearch).toHaveBeenCalledTimes(1)
  })

  it('clears filters when Clear filters is clicked', async () => {
    renderSearch()
    const user = userEvent.setup()

    await user.click(screen.getByTitle('Advanced search'))
    await user.click(screen.getByText('Clear filters'))

    expect(defaultProps.onSearch).toHaveBeenCalled()
  })
})
