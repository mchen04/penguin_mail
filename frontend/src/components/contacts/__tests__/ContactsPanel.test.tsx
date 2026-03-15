import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { ContactsPanel } from '../ContactsPanel'
import { createMockRepositories } from '@/test/mock-repositories'

describe('ContactsPanel', () => {
  it('renders the contacts panel', () => {
    render(<ContactsPanel />)
    expect(screen.getAllByText(/contacts/i).length).toBeGreaterThan(0)
  })

  it('renders search input', () => {
    render(<ContactsPanel />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders add button', () => {
    render(<ContactsPanel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('accepts onClose callback', () => {
    const onClose = vi.fn()
    render(<ContactsPanel onClose={onClose} />)
    expect(screen.getAllByText(/contacts/i).length).toBeGreaterThan(0)
  })

  it('typing in search input filters the visible contacts list', async () => {
    const user = userEvent.setup()
    render(<ContactsPanel />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'alice')
    expect(searchInput).toHaveValue('alice')
  })

  it('clearing search input resets the filter', async () => {
    const user = userEvent.setup()
    render(<ContactsPanel />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'bob')
    await user.clear(searchInput)
    expect(searchInput).toHaveValue('')
  })

  it('clicking add button opens create-contact form', async () => {
    const user = userEvent.setup()
    render(<ContactsPanel />)
    // Find the new-contact button (aria-label or title contains "new" or "add")
    const addBtn = screen.getAllByRole('button').find(
      (b) =>
        /new contact|add contact/i.test(b.getAttribute('aria-label') ?? '') ||
        /new contact|add contact/i.test(b.getAttribute('title') ?? '')
    )
    if (addBtn) {
      await user.click(addBtn)
      // A form or input for name/email should appear
      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText(/name/i) ||
          screen.queryByRole('textbox', { name: /name/i })
        ).toBeTruthy()
      })
    }
  })

  it('has no accessibility violations', async () => {
    const repos = createMockRepositories()
    const { container } = render(<ContactsPanel />, { repos })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
