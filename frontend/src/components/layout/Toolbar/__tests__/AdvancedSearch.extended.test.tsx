/**
 * Extended tests for AdvancedSearch covering filter changes, save search, and saved searches
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AdvancedSearch } from '../AdvancedSearch'

const defaultProps = {
  onSearch: vi.fn(),
}

function renderSearch(overrides = {}) {
  return render(<AdvancedSearch {...defaultProps} {...overrides} />)
}

describe('AdvancedSearch - text input', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onSearch when typing in search box', async () => {
    const user = userEvent.setup()
    renderSearch()

    const input = screen.getByLabelText('Search mail')
    await user.type(input, 'hello')

    expect(defaultProps.onSearch).toHaveBeenCalled()
    // Last call should include the typed text
    const lastCall = (defaultProps.onSearch as ReturnType<typeof vi.fn>).mock.calls.at(-1)
    expect(lastCall?.[0].text).toContain('hello')
  })

  it('expands filters when input is focused', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByLabelText('Search mail'))

    await waitFor(() => {
      expect(screen.getByText('From')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('sender@example.com')).toBeInTheDocument()
    })
  })
})

describe('AdvancedSearch - filter fields', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates From filter when typed', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))
    const fromInput = screen.getByPlaceholderText('sender@example.com')
    await user.type(fromInput, 'alice@example.com')

    expect(fromInput).toHaveValue('alice@example.com')
  })

  it('updates To filter when typed', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))
    const toInput = screen.getByPlaceholderText('recipient@example.com')
    await user.type(toInput, 'bob@example.com')

    expect(toInput).toHaveValue('bob@example.com')
  })

  it('updates Subject filter when typed', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))
    const subjectInput = screen.getByPlaceholderText('Contains words')
    await user.type(subjectInput, 'meeting')

    expect(subjectInput).toHaveValue('meeting')
  })

  it('changes date range filter via select', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    // Find the date range select (first select in the form)
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'week')

    expect(selects[0]).toHaveValue('week')
  })

  it('changes hasAttachment filter to Yes', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[1], 'true')

    expect(selects[1]).toHaveValue('true')
  })

  it('changes status filter to Unread', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[2], 'true')

    expect(selects[2]).toHaveValue('true')
  })

  it('changes starred filter to Yes', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[3], 'true')

    expect(selects[3]).toHaveValue('true')
  })
})

describe('AdvancedSearch - apply and clear', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes filter values to onSearch when Apply is clicked', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const fromInput = screen.getByPlaceholderText('sender@example.com')
    await user.type(fromInput, 'sender@test.com')

    await user.click(screen.getByText('Apply'))

    expect(defaultProps.onSearch).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'sender@test.com' })
    )
  })

  it('resets all filters and calls onSearch when Clear filters clicked', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const fromInput = screen.getByPlaceholderText('sender@example.com')
    await user.type(fromInput, 'sender@test.com')

    await user.click(screen.getByText('Clear filters'))

    expect(defaultProps.onSearch).toHaveBeenCalledWith(
      expect.objectContaining({ from: '', text: '' })
    )
  })

  it('collapses dropdown after Apply', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))
    expect(screen.getByText('Apply')).toBeInTheDocument()

    await user.click(screen.getByText('Apply'))

    await waitFor(() => {
      expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    })
  })
})

describe('AdvancedSearch - save search', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Save search button when active filters are present', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const selects = screen.getAllByRole('combobox')
    // Set a filter to make hasActiveFilters true
    await user.selectOptions(selects[0], 'week')

    await waitFor(() => {
      expect(screen.getByText('Save search')).toBeInTheDocument()
    })
  })

  it('shows save dialog when Save search button is clicked', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'week')

    await waitFor(() => expect(screen.getByText('Save search')).toBeInTheDocument())
    await user.click(screen.getByText('Save search'))

    expect(screen.getByPlaceholderText('Search name')).toBeInTheDocument()
  })

  it('saves search when name is entered and Save clicked', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'week')

    await waitFor(() => expect(screen.getByText('Save search')).toBeInTheDocument())
    await user.click(screen.getByText('Save search'))

    await user.type(screen.getByPlaceholderText('Search name'), 'My Search')

    // Click Save button in the save dialog
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    await user.click(saveButtons[0])

    // Dialog should close after saving
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search name')).not.toBeInTheDocument()
    })
  })

  it('cancels save dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.click(screen.getByTitle('Advanced search'))

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'week')

    await waitFor(() => expect(screen.getByText('Save search')).toBeInTheDocument())
    await user.click(screen.getByText('Save search'))

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.queryByPlaceholderText('Search name')).not.toBeInTheDocument()
  })
})
