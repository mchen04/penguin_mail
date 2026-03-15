import { describe, it, expect, vi } from 'vitest'
import { useEffect } from 'react'
import { axe } from 'vitest-axe'
import { render, screen, waitFor } from '@/test/test-utils'
import { EmailList } from '../EmailList'
import { createMockRepositories } from '@/test/mock-repositories'
import { useEmail } from '@/context/EmailContext'
import type { Email } from '@/types/email'

// ─── Shared email data ────────────────────────────────────────────────────────

const makeEmail = (overrides: Partial<Email> = {}): Email => ({
  id: 'e1',
  accountId: 'acc-1',
  accountColor: 'blue',
  from: { name: 'Alice', email: 'alice@example.com' },
  to: [{ name: 'Bob', email: 'bob@example.com' }],
  subject: 'Test Email Subject',
  preview: 'Preview text here',
  body: '<p>Body</p>',
  date: new Date('2026-01-01T10:00:00'),
  isRead: false,
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  folder: 'inbox' as const,
  labels: [],
  threadId: 'thread-1',
  isDraft: false,
  ...overrides,
})

// Helper: returns repos pre-configured with a given set of inbox emails
function reposWithEmails(emails: Email[]) {
  const repos = createMockRepositories()
  repos.emails.search = vi.fn().mockResolvedValue({
    data: emails,
    total: emails.length,
    page: 1,
    pageSize: 50,
    totalPages: Math.ceil(emails.length / 50),
  })
  return repos
}

// Wrapper that sets search query via real EmailContext
function WithSearch({ query, children }: { query: string; children: React.ReactNode }) {
  const { setSearch } = useEmail()
  useEffect(() => { setSearch(query) }, [query, setSearch])
  return <>{children}</>
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EmailList', () => {
  it('renders the email list grid with correct aria label', async () => {
    const repos = reposWithEmails([makeEmail()])
    render(<EmailList />, { repos })
    await waitFor(() => {
      expect(screen.getByRole('grid', { name: 'Email list' })).toBeInTheDocument()
    })
  })

  it('shows "Your inbox is empty" empty state when inbox has no emails', async () => {
    render(<EmailList />)
    await waitFor(() => {
      expect(screen.getByText('Your inbox is empty')).toBeInTheDocument()
    })
  })

  it('shows "No results found" when searching with no matches', async () => {
    render(
      <WithSearch query="zzznotfound">
        <EmailList />
      </WithSearch>
    )
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })
  })

  it('renders email subject in rows when emails are present', async () => {
    const repos = reposWithEmails([
      makeEmail({ id: 'e1', subject: 'Hello World', threadId: 'thread-1' }),
      makeEmail({ id: 'e2', subject: 'Second Email', threadId: 'thread-2' }),
    ])
    render(<EmailList />, { repos })
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument()
      expect(screen.getByText('Second Email')).toBeInTheDocument()
    })
  })

  it('renders sender name in email rows', async () => {
    const repos = reposWithEmails([
      makeEmail({ from: { name: 'Charlie Brown', email: 'charlie@example.com' } }),
    ])
    render(<EmailList />, { repos })
    await waitFor(() => {
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton with aria-busy=true while loading', () => {
    const repos = createMockRepositories()
    // Never resolves — keeps component in loading state
    repos.emails.search = vi.fn().mockReturnValue(new Promise(() => {}))
    render(<EmailList />, { repos })
    expect(screen.getByRole('grid', { name: 'Email list' })).toHaveAttribute('aria-busy', 'true')
  })

  it('shows email-count info when more than PAGE_SIZE emails exist', async () => {
    const manyEmails = Array.from({ length: 55 }, (_, i) =>
      makeEmail({ id: `e${i}`, subject: `Email ${i}`, threadId: `thread-${i}` })
    )
    const repos = reposWithEmails(manyEmails)
    render(<EmailList />, { repos })
    await waitFor(() => {
      expect(screen.getByText(/showing/i)).toBeInTheDocument()
    })
  })

  it('accepts onOpenEmail callback without errors', async () => {
    const repos = reposWithEmails([makeEmail()])
    render(<EmailList onOpenEmail={() => {}} />, { repos })
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  it('has no accessibility violations in empty state', async () => {
    const { container } = render(<EmailList />)
    await waitFor(() => {
      expect(screen.getByText('Your inbox is empty')).toBeInTheDocument()
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations with emails rendered', async () => {
    const repos = reposWithEmails([
      makeEmail({ id: 'e1', subject: 'Hello World', threadId: 'thread-1' }),
    ])
    const { container } = render(<EmailList />, { repos })
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
