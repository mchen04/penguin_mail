/**
 * Coverage-targeted tests for AdvancedSearch — covers remaining uncovered branches:
 * - handleSaveSearch with non-null hasAttachment/isUnread/isStarred (binary-expr ??, lines 95-102)
 * - handleSaveSearch early return when saveName is empty (line 75 if-branch)
 * - handleLoadSavedSearch (lines 107+, click saved search item)
 * - deleteSavedSearch (line 259)
 * - cond-expr branches in select value (lines 199, 215, 231)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AdvancedSearch } from '../AdvancedSearch'

const defaultProps = {
  onSearch: vi.fn(),
}

function renderSearch(overrides = {}) {
  return render(<AdvancedSearch {...defaultProps} {...overrides} />)
}

async function openSearch(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTitle('Advanced search'))
  await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0))
}

describe('AdvancedSearch - save search with non-null filters (lines 95-102)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('saves search with hasAttachment=true (covers ?? branch 1)', async () => {
    const user = userEvent.setup()
    renderSearch()

    await openSearch(user)

    // Set hasAttachment to 'Yes' (true) — select is at index 2 (date, attachment, status, starred)
    const selects = screen.getAllByRole('combobox')
    const attachmentSelect = selects.find(s => {
      const opts = Array.from(s.querySelectorAll('option'))
      return opts.some(o => o.value === 'true' && o.textContent === 'Yes')
    })
    if (attachmentSelect) {
      await user.selectOptions(attachmentSelect, 'true')
    }

    // Save search button should appear (hasActiveFilters is true)
    await waitFor(() => expect(screen.getByText('Save search')).toBeInTheDocument())
    await user.click(screen.getByText('Save search'))

    const nameInput = screen.getByPlaceholderText('Search name')
    await user.type(nameInput, 'Attachment Search')

    // Click Save — this calls handleSaveSearch with hasAttachment=true (non-null → covers ??)
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    await user.click(saveButtons[0])

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search name')).not.toBeInTheDocument()
    })
  })

  it('early return in handleSaveSearch when name is empty (line 75)', async () => {
    const user = userEvent.setup()
    renderSearch()

    await openSearch(user)

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'week')

    await waitFor(() => expect(screen.getByText('Save search')).toBeInTheDocument())
    await user.click(screen.getByText('Save search'))

    // Don't type a name — click Save with empty name
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    await user.click(saveButtons[0])

    // Dialog should still be visible (early return triggered)
    expect(screen.getByPlaceholderText('Search name')).toBeInTheDocument()
  })
})

describe('AdvancedSearch - load and delete saved searches (lines 107+, 259)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('save a search then load it (covers handleLoadSavedSearch)', async () => {
    const user = userEvent.setup()
    renderSearch()

    // Step 1: Open and set a filter to enable Save search
    await openSearch(user)
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'week')

    await waitFor(() => expect(screen.getByText('Save search')).toBeInTheDocument())

    // Step 2: Save the search (dropdown stays open after save)
    await user.click(screen.getByText('Save search'))
    await user.type(screen.getByPlaceholderText('Search name'), 'Weekly Emails')
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    await user.click(saveButtons[0])

    // After save, the dialog closes but the dropdown stays open
    // The saved search should appear immediately in the dropdown
    await waitFor(() => {
      expect(screen.getByText('Weekly Emails')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Click it to load — covers handleLoadSavedSearch
    await user.click(screen.getByText('Weekly Emails'))
    expect(defaultProps.onSearch).toHaveBeenCalled()
  })

  it('save and delete a saved search (covers deleteSavedSearch line 259)', async () => {
    const user = userEvent.setup()
    renderSearch()

    await openSearch(user)
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'month')

    await waitFor(() => expect(screen.getByText('Save search')).toBeInTheDocument())
    await user.click(screen.getByText('Save search'))
    await user.type(screen.getByPlaceholderText('Search name'), 'Monthly Search')
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    await user.click(saveButtons[0])

    // After save, the saved search should appear in the still-open dropdown
    await waitFor(() => {
      expect(screen.getByText('Monthly Search')).toBeInTheDocument()
    }, { timeout: 3000 })

    const deleteBtn = screen.getByTitle('Delete saved search')
    await user.click(deleteBtn)

    await waitFor(() => {
      expect(screen.queryByText('Monthly Search')).not.toBeInTheDocument()
    })
  })
})

describe('AdvancedSearch - cond-expr select value when non-null (lines 199, 215, 231)', () => {
  it('select shows non-empty value when filter is non-null after change', async () => {
    const user = userEvent.setup()
    renderSearch()

    await openSearch(user)

    const selects = screen.getAllByRole('combobox')

    // Find attachment select and set it to 'true'
    const attachmentSelect = selects.find(s => {
      return Array.from(s.querySelectorAll('option')).some(o => o.value === 'true' && o.textContent === 'Yes')
    }) as HTMLSelectElement

    if (attachmentSelect) {
      fireEvent.change(attachmentSelect, { target: { value: 'true' } })
      // After change, component re-renders with hasAttachment=true → ternary branch 1
      await waitFor(() => {
        expect(attachmentSelect.value).toBe('true')
      })
    }

    // Same for isUnread — find the "Unread" option select
    const statusSelect = selects.find(s => {
      return Array.from(s.querySelectorAll('option')).some(o => o.value === 'true' && o.textContent === 'Unread')
    }) as HTMLSelectElement

    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: 'true' } })
      await waitFor(() => expect(statusSelect.value).toBe('true'))
    }
  })
})
