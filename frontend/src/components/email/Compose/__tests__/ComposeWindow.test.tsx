import { describe, it, expect, vi } from 'vitest'
import { useEffect } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ComposeWindow } from '../ComposeWindow'
import { render } from '@/test/test-utils'
import { createMockRepositories } from '@/test/mock-repositories'
import { useApp } from '@/context/AppContext'
import type { Account } from '@/types/account'

const testAccount: Account = {
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
  repos.accounts.getAll = vi.fn().mockResolvedValue([testAccount])
  return repos
}

// Renders ComposeWindow and opens it via the real AppContext on mount
function OpenedCompose() {
  const { openCompose } = useApp()
  useEffect(() => { openCompose() }, [openCompose])
  return <ComposeWindow />
}

// Renders ComposeWindow in minimized state
function MinimizedCompose() {
  const { openCompose, minimizeCompose } = useApp()
  useEffect(() => {
    openCompose()
    minimizeCompose()
  }, [openCompose, minimizeCompose])
  return <ComposeWindow />
}

describe('ComposeWindow', () => {
  it('renders nothing when compose is not open', () => {
    const { container } = render(<ComposeWindow />)
    expect(container.childElementCount).toBe(0)
  })

  it('renders subject and body fields when open', async () => {
    render(<OpenedCompose />, { repos: makeRepos() })
    expect(await screen.findByPlaceholderText('Subject')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('Send button is disabled when no recipients', async () => {
    render(<OpenedCompose />, { repos: makeRepos() })
    const sendBtn = await screen.findByRole('button', { name: 'Send' })
    expect(sendBtn).toBeDisabled()
  })

  it('closes compose window when Close button is clicked', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })
    await screen.findByRole('button', { name: 'Close' })
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Subject')).not.toBeInTheDocument()
    })
  })

  it('hides compose body when Minimize button is clicked', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })
    await screen.findByRole('button', { name: 'Minimize' })
    await user.click(screen.getByRole('button', { name: 'Minimize' }))
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Subject')).not.toBeInTheDocument()
    })
  })

  it('compose remains visible after Maximize button is clicked', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })
    await screen.findByRole('button', { name: 'Maximize' })
    await user.click(screen.getByRole('button', { name: 'Maximize' }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Subject')).toBeInTheDocument()
    })
  })

  it('shows title "New Message" when subject is empty', async () => {
    render(<OpenedCompose />, { repos: makeRepos() })
    expect(await screen.findByText('New Message')).toBeInTheDocument()
  })

  it('hides body and fields in minimized state', async () => {
    render(<MinimizedCompose />, { repos: makeRepos() })
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Subject')).not.toBeInTheDocument()
    })
  })

  it('shows from account selector', async () => {
    render(<OpenedCompose />, { repos: makeRepos() })
    expect(await screen.findByText(/test@example\.com/)).toBeInTheDocument()
  })

  it('has no accessibility violations when open', async () => {
    const { container } = render(<OpenedCompose />, { repos: makeRepos() })
    await screen.findByPlaceholderText('Subject')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('enables Send and calls email create after a recipient is added', async () => {
    const repos = makeRepos()
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos })

    const toInput = await screen.findByPlaceholderText('Enter email addresses')
    await user.type(toInput, 'bob@example.com')
    await user.keyboard('{Enter}')

    const sendBtn = screen.getByRole('button', { name: 'Send' })
    expect(sendBtn).toBeEnabled()

    await user.click(sendBtn)

    await waitFor(() => {
      expect(repos.emails.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.arrayContaining([
            expect.objectContaining({ email: 'bob@example.com' }),
          ]),
        })
      )
    })
  })
})
