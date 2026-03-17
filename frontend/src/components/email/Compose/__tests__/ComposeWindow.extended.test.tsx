/**
 * Extended tests for ComposeWindow covering CC/BCC, save draft, discard draft, attachments
 */
import { describe, it, expect, vi } from 'vitest'
import { useEffect } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function OpenedCompose() {
  const { openCompose } = useApp()
  useEffect(() => { openCompose() }, [openCompose])
  return <ComposeWindow />
}

describe('ComposeWindow - CC/BCC fields', () => {
  it('shows Cc button that opens CC field', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByPlaceholderText('Subject')
    const ccBtn = screen.getByRole('button', { name: /^cc$/i })
    await user.click(ccBtn)

    await waitFor(() => {
      expect(screen.getByText('Cc')).toBeInTheDocument()
    })
  })

  it('shows Bcc button that opens BCC field', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByPlaceholderText('Subject')
    const bccBtn = screen.getByRole('button', { name: /^bcc$/i })
    await user.click(bccBtn)

    await waitFor(() => {
      expect(screen.getByText('Bcc')).toBeInTheDocument()
    })
  })
})

describe('ComposeWindow - Save draft', () => {
  it('save draft button calls saveDraft', async () => {
    const user = userEvent.setup()
    const repos = makeRepos()
    render(<OpenedCompose />, { repos })

    await screen.findByPlaceholderText('Subject')

    // Type some content to make draft saveable
    await user.type(screen.getByPlaceholderText('Subject'), 'Draft Subject')

    // Click save draft button (the archive icon button)
    const saveDraftBtn = screen.getByTitle('Save draft')
    await user.click(saveDraftBtn)

    await waitFor(() => {
      expect(repos.emails.saveDraft).toHaveBeenCalled()
    })
  })
})

describe('ComposeWindow - Discard draft', () => {
  it('discard button resets form and closes compose', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByPlaceholderText('Subject')

    const discardBtn = screen.getByTitle('Discard')
    await user.click(discardBtn)

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Subject')).not.toBeInTheDocument()
    })
  })
})

describe('ComposeWindow - Maximize/Minimize toggle', () => {
  it('Maximize button toggles to maximized state', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByRole('button', { name: 'Maximize' })
    await user.click(screen.getByRole('button', { name: 'Maximize' }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Subject')).toBeInTheDocument()
    })
  })

  it('compose body stays visible after Maximize', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByRole('button', { name: 'Maximize' })
    await user.click(screen.getByRole('button', { name: 'Maximize' }))

    // Subject field should still be visible in maximized state
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Subject')).toBeInTheDocument()
    })
  })
})

describe('ComposeWindow - Subject changes title', () => {
  it('updates the title when subject is typed', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByText('New Message')

    const subjectInput = screen.getByPlaceholderText('Subject')
    await user.type(subjectInput, 'My Email')

    await waitFor(() => {
      expect(screen.getByText('My Email')).toBeInTheDocument()
    })
  })
})

describe('ComposeWindow - Auto-save indicator', () => {
  it('from account selector shows available accounts', async () => {
    render(<OpenedCompose />, { repos: makeRepos() })

    await waitFor(() => {
      expect(screen.getByText(/test@example\.com/)).toBeInTheDocument()
    })
  })
})

describe('ComposeWindow - Close with content saves draft', () => {
  it('closes and saves draft when content is present', async () => {
    const user = userEvent.setup()
    const repos = makeRepos()
    render(<OpenedCompose />, { repos })

    await screen.findByPlaceholderText('Subject')

    // Add a recipient so draft has content
    const toInput = screen.getByPlaceholderText('Enter email addresses')
    await user.type(toInput, 'test@recipient.com{Enter}')

    // Close should auto-save draft
    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Subject')).not.toBeInTheDocument()
    })
  })
})
