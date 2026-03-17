/**
 * Extended tests for RecipientField covering contact suggestions, keyboard navigation,
 * backspace removal, and Tab key behavior
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { RecipientField } from '../RecipientField'
import { createMockRepositories } from '@/test/mock-repositories'

const defaultProps = {
  label: 'To',
  recipients: [] as string[],
  onChange: vi.fn(),
  placeholder: 'Enter email addresses',
}

function makeReposWithContacts() {
  const repos = createMockRepositories()
  // contacts are loaded from ContactsContext which uses repos.contacts
  repos.contacts.getAll = vi.fn().mockResolvedValue({
    data: [
      { id: 'c1', name: 'Alice Smith', email: 'alice@example.com', labels: [], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 'c2', name: 'Bob Jones', email: 'bob@example.com', labels: [], isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
    ],
    total: 2, page: 1, pageSize: 50, totalPages: 1,
  })
  return repos
}

describe('RecipientField - Tab key', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds recipient when Tab key is pressed with valid email', async () => {
    const onChange = vi.fn()
    render(<RecipientField {...defaultProps} onChange={onChange} />)
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.type(input, 'test@example.com')
    await user.tab()

    expect(onChange).toHaveBeenCalledWith(['test@example.com'])
  })
})

describe('RecipientField - Backspace removal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('removes last recipient on Backspace when input is empty', async () => {
    const onChange = vi.fn()
    render(
      <RecipientField
        {...defaultProps}
        recipients={['alice@example.com', 'bob@example.com']}
        onChange={onChange}
      />
    )
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Backspace}')

    expect(onChange).toHaveBeenCalledWith(['alice@example.com'])
  })

  it('does not remove recipients on Backspace when input has value', async () => {
    const onChange = vi.fn()
    render(
      <RecipientField
        {...defaultProps}
        recipients={['alice@example.com']}
        onChange={onChange}
      />
    )
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.type(input, 'b')
    await user.keyboard('{Backspace}')

    // onChange would only be called if backspace removes a chip
    // Here it should NOT remove the existing chip since input is not empty
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('RecipientField - Contact suggestions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows contact suggestions when typing a matching name', async () => {
    const repos = makeReposWithContacts()
    const user = userEvent.setup()

    render(
      <RecipientField {...defaultProps} />,
      { repos }
    )

    // Wait for contacts to load
    await waitFor(() => expect(repos.contacts.getAll).toHaveBeenCalled())

    const input = screen.getByRole('textbox')
    await user.type(input, 'Alice')

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
  })

  it('selects a suggestion when clicked', async () => {
    const onChange = vi.fn()
    const repos = makeReposWithContacts()
    const user = userEvent.setup()

    render(
      <RecipientField {...defaultProps} onChange={onChange} />,
      { repos }
    )

    await waitFor(() => expect(repos.contacts.getAll).toHaveBeenCalled())

    const input = screen.getByRole('textbox')
    await user.type(input, 'Alice')

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())

    // Use mousedown to trigger suggestion selection
    await user.click(screen.getByText('Alice Smith'))

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('alice@example.com')])
    )
  })

  it('navigates suggestions with ArrowDown key', async () => {
    const repos = makeReposWithContacts()
    const user = userEvent.setup()

    render(
      <RecipientField {...defaultProps} />,
      { repos }
    )

    await waitFor(() => expect(repos.contacts.getAll).toHaveBeenCalled())

    const input = screen.getByRole('textbox')
    await user.type(input, 'alice')

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    await user.keyboard('{ArrowDown}')

    // First suggestion should be highlighted
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('closes suggestions with Escape key', async () => {
    const repos = makeReposWithContacts()
    const user = userEvent.setup()

    render(
      <RecipientField {...defaultProps} />,
      { repos }
    )

    await waitFor(() => expect(repos.contacts.getAll).toHaveBeenCalled())

    const input = screen.getByRole('textbox')
    await user.type(input, 'alice')

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('does not show already-added recipients in suggestions', async () => {
    const repos = makeReposWithContacts()
    const user = userEvent.setup()

    render(
      <RecipientField
        {...defaultProps}
        recipients={['Alice Smith <alice@example.com>']}
      />,
      { repos }
    )

    await waitFor(() => expect(repos.contacts.getAll).toHaveBeenCalled())

    const input = screen.getByRole('textbox')
    await user.type(input, 'alice')

    // Alice is already a recipient, so she should NOT appear in suggestions
    await waitFor(() => {
      // Either the listbox doesn't appear or Alice is not in it
      const listbox = screen.queryByRole('listbox')
      if (listbox) {
        expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
      }
    })
  })
})

describe('RecipientField - comma-separated paste', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds recipient when comma is typed after a valid email', async () => {
    const onChange = vi.fn()
    render(<RecipientField {...defaultProps} onChange={onChange} />)
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    // Type a valid email then press comma to add it
    await user.type(input, 'a@example.com')
    await user.keyboard(',')

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall).toContain('a@example.com')
  })

  it('does not duplicate an already-added recipient', async () => {
    const onChange = vi.fn()
    render(
      <RecipientField
        {...defaultProps}
        recipients={['alice@example.com']}
        onChange={onChange}
      />
    )
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.type(input, 'alice@example.com{Enter}')

    // Alice is already in the list, so onChange shouldn't add her again
    if (onChange.mock.calls.length > 0) {
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
      const aliceCount = lastCall.filter((r: string) => r === 'alice@example.com').length
      expect(aliceCount).toBeLessThanOrEqual(1)
    }
  })
})
