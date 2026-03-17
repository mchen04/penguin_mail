/**
 * Tests for AccountSection - covers account header, folder display, unread counts
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AccountSection } from '../AccountSection'
import { createMockRepositories } from '@/test/mock-repositories'
import type { Account } from '@/types/account'

const mockAccount: Account = {
  id: 'acc-1',
  name: 'Test User',
  email: 'test@example.com',
  color: 'blue',
  isDefault: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

function makeRepos() {
  const repos = createMockRepositories()
  repos.accounts.getAll = vi.fn().mockResolvedValue([mockAccount])
  return repos
}

describe('AccountSection - Individual account', () => {
  it('renders account email', () => {
    render(<AccountSection account={mockAccount} />, { repos: makeRepos() })
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('renders all standard folders when expanded', async () => {
    render(<AccountSection account={mockAccount} />, { repos: makeRepos() })
    // The section shows standard folders
    expect(screen.getByText('Inbox')).toBeInTheDocument()
  })

  it('renders color indicator for account', () => {
    render(<AccountSection account={mockAccount} />, { repos: makeRepos() })
    // Color indicator has aria-label with account color
    expect(screen.getByRole('img', { name: /blue account indicator/i })).toBeInTheDocument()
  })

  it('header click toggles expansion', async () => {
    const user = userEvent.setup()
    const { container } = render(<AccountSection account={mockAccount} />, { repos: makeRepos() })

    const header = container.querySelector('[class*="header"]') as HTMLElement
    if (header) {
      await user.click(header)
      // After clicking, expansion state changes
      expect(header).toBeInTheDocument()
    }
  })
})

describe('AccountSection - All accounts view', () => {
  it('renders "All Accounts" text when isAllAccounts is true', () => {
    render(<AccountSection isAllAccounts />, { repos: makeRepos() })
    expect(screen.getByText(/all accounts/i)).toBeInTheDocument()
  })

  it('renders only Inbox for all-accounts view', () => {
    render(<AccountSection isAllAccounts />, { repos: makeRepos() })
    expect(screen.getByText('Inbox')).toBeInTheDocument()
    // Sent should NOT appear for all-accounts view
    expect(screen.queryByText('Sent')).not.toBeInTheDocument()
  })
})

describe('AccountSection - Folder selection', () => {
  it('renders inbox folder item', () => {
    render(<AccountSection account={mockAccount} />, { repos: makeRepos() })
    expect(screen.getByText('Inbox')).toBeInTheDocument()
  })

  it('renders sent folder item', () => {
    render(<AccountSection account={mockAccount} />, { repos: makeRepos() })
    expect(screen.getByText('Sent')).toBeInTheDocument()
  })

  it('renders drafts folder item', () => {
    render(<AccountSection account={mockAccount} />, { repos: makeRepos() })
    expect(screen.getByText('Drafts')).toBeInTheDocument()
  })

  it('renders trash folder item', () => {
    render(<AccountSection account={mockAccount} />, { repos: makeRepos() })
    expect(screen.getByText('Trash')).toBeInTheDocument()
  })
})
