/**
 * Extended tests for Sidebar - covers Add Account dialog, Help dialog, and overlay
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '../Sidebar'
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

describe('Sidebar - Extended coverage', () => {
  it('renders Add account button', () => {
    render(<Sidebar />, { repos: makeRepos() })
    expect(screen.getByText(/add account/i)).toBeInTheDocument()
  })

  it('renders Help button', () => {
    render(<Sidebar />, { repos: makeRepos() })
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('opens Help dialog when Help button is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />, { repos: makeRepos() })

    await user.click(screen.getByText('Help'))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('opens Add Account dialog when Add account button is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />, { repos: makeRepos() })

    await user.click(screen.getByText(/add account/i))

    await waitFor(() => {
      expect(screen.getByText('Add Email Account')).toBeInTheDocument()
    })
  })

  it('closes Help dialog when Got it is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />, { repos: makeRepos() })

    await user.click(screen.getByText('Help'))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /got it/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes Add Account dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />, { repos: makeRepos() })

    await user.click(screen.getByText(/add account/i))

    await waitFor(() => {
      expect(screen.getByText('Add Email Account')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByText('Add Email Account')).not.toBeInTheDocument()
    })
  })

  it('renders account sections for loaded accounts', async () => {
    render(<Sidebar />, { repos: makeRepos() })

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })
})
