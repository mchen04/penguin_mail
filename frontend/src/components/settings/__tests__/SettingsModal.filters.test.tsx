/**
 * Tests for SettingsModal filters tab:
 * - Filter list display (when filters exist)
 * - Toggle filter enabled/disabled
 * - Edit filter button
 * - Delete filter button
 * - Action value input (for moveTo/addLabel action types)
 */
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { createMockRepositories } from '@/test/mock-repositories'
import type { FilterRule } from '@/types/settings'
import { SettingsModal } from '../SettingsModal/SettingsModal'

const mockFilter: FilterRule = {
  id: 'filter-1',
  name: 'Newsletter Filter',
  enabled: true,
  conditions: [
    { field: 'from', operator: 'contains', value: 'newsletter' },
  ],
  matchAll: true,
  actions: [
    { type: 'archive' },
  ],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

function makeReposWithFilter() {
  const repos = createMockRepositories()
  repos.settings.get = vi.fn().mockResolvedValue({
    appearance: { theme: 'light', density: 'default', fontSize: 'medium' },
    notifications: {
      emailNotifications: true,
      desktopNotifications: false,
      soundEnabled: true,
      notifyOnNewEmail: true,
      notifyOnMention: true,
    },
    inboxBehavior: {
      defaultReplyBehavior: 'reply',
      sendBehavior: 'immediately',
      conversationView: true,
      readingPanePosition: 'right',
      autoAdvance: 'next',
      markAsReadDelay: 0,
    },
    language: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    },
    signatures: [],
    vacationResponder: {
      enabled: false,
      subject: '',
      message: '',
      startDate: null,
      endDate: null,
      sendToContacts: true,
      sendToEveryone: false,
    },
    keyboardShortcuts: [],
    filters: [mockFilter],
    blockedAddresses: [],
    templates: [],
  })
  return repos
}

function renderSettingsModal(repos = createMockRepositories()) {
  return render(<SettingsModal isOpen={true} onClose={() => {}} />, { repos })
}

async function navigateToFiltersTab(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /^filters$/i })).toBeInTheDocument()
  })
  await user.click(screen.getByRole('button', { name: /^filters$/i }))
  await waitFor(() => {
    expect(screen.getByText(/email filters/i)).toBeInTheDocument()
  })
}

describe('SettingsModal - filter list display', () => {
  it('shows existing filters in the list', async () => {
    const user = userEvent.setup()
    renderSettingsModal(makeReposWithFilter())

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByText('Newsletter Filter')).toBeInTheDocument()
    })
  })

  it('shows filter conditions in the list', async () => {
    const user = userEvent.setup()
    renderSettingsModal(makeReposWithFilter())

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByText('Newsletter Filter')).toBeInTheDocument()
    })
    // Filter description shows field and action type
    expect(screen.getByText(/archive/i)).toBeInTheDocument()
  })

  it('shows Edit button for each filter', async () => {
    const user = userEvent.setup()
    renderSettingsModal(makeReposWithFilter())

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
    })
  })

  it('shows Delete button for each filter', async () => {
    const user = userEvent.setup()
    renderSettingsModal(makeReposWithFilter())

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    })
  })

  it('removes filter from list when Delete button is clicked', async () => {
    const user = userEvent.setup()
    renderSettingsModal(makeReposWithFilter())

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => {
      // After deletion, the filter should no longer appear in the list
      expect(screen.queryByText('Newsletter Filter')).not.toBeInTheDocument()
    })
  })

  it('opens edit form when Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderSettingsModal(makeReposWithFilter())

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^edit$/i }))

    await waitFor(() => {
      // Form should appear with "Save Changes" button
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })
  })

  it('toggles filter enabled state via checkbox', async () => {
    const user = userEvent.setup()
    renderSettingsModal(makeReposWithFilter())

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByText('Newsletter Filter')).toBeInTheDocument()
    })

    // Find the toggle checkbox for the filter (initially enabled=true, so checked)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)

    // Click the checkbox to toggle it
    await user.click(checkbox)

    // The checkbox state should change (dispatches UPDATE_FILTER action)
    await waitFor(() => {
      const updatedCheckbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(updatedCheckbox.checked).toBe(false)
    })
  })
})

describe('SettingsModal - filter action value input', () => {
  it('shows action value input when moveTo is selected as action type', async () => {
    const user = userEvent.setup()
    renderSettingsModal()

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create filter/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /create filter/i }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/e\.g\., move newsletters/i)).toBeInTheDocument()
    })

    // Change action type to 'moveTo'
    const actionSelect = screen.getAllByRole('combobox').find(el => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.some(o => o.value === 'moveTo')
    })
    expect(actionSelect).toBeTruthy()

    if (actionSelect) {
      fireEvent.change(actionSelect, { target: { value: 'moveTo' } })
    }

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/folder\/label name/i)).toBeInTheDocument()
    })
  })

  it('allows typing in the action value input', async () => {
    const user = userEvent.setup()
    renderSettingsModal()

    await navigateToFiltersTab(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create filter/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /create filter/i }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/e\.g\., move newsletters/i)).toBeInTheDocument()
    })

    // Change action type to 'moveTo' to show the value input
    const actionSelect = screen.getAllByRole('combobox').find(el => {
      const options = Array.from(el.querySelectorAll('option'))
      return options.some(o => o.value === 'moveTo')
    })

    if (actionSelect) {
      fireEvent.change(actionSelect, { target: { value: 'moveTo' } })

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/folder\/label name/i)).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/folder\/label name/i), 'newsletters')
      expect(screen.getByPlaceholderText(/folder\/label name/i)).toHaveValue('newsletters')
    }
  })
})
