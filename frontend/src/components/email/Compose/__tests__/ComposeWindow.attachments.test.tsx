/**
 * Attachment and schedule-picker tests for ComposeWindow — covers:
 * - Adding an attachment via file input (lines 505-519: attachment list rendering)
 * - Removing an attachment (line 223-229)
 * - ScheduleSendPicker cancel button (line 549)
 */
import { describe, it, expect, vi } from 'vitest'
import { useEffect } from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
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

describe('ComposeWindow - file attachment (lines 505-519)', () => {
  it('renders attachment list after file is attached', async () => {
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByPlaceholderText('Subject')

    // Find the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeTruthy()

    // Create a mock file and trigger the change event
    const file = new File(['file content'], 'test-document.pdf', { type: 'application/pdf' })
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    })
    fireEvent.change(fileInput)

    // Attachment list should appear
    await waitFor(() => {
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
    })
  })

  it('removes attachment when remove button is clicked', async () => {
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByPlaceholderText('Subject')

    // Add an attachment first
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'remove-me.txt', { type: 'text/plain' })
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText('remove-me.txt')).toBeInTheDocument()
    })

    // Click the remove button
    const removeBtn = screen.getByRole('button', { name: /remove remove-me\.txt/i })
    fireEvent.click(removeBtn)

    await waitFor(() => {
      expect(screen.queryByText('remove-me.txt')).not.toBeInTheDocument()
    })
  })
})

describe('ComposeWindow - schedule picker cancel (line 549)', () => {
  it('closes schedule picker when Cancel is clicked inside it', async () => {
    const user = userEvent.setup()
    render(<OpenedCompose />, { repos: makeRepos() })

    await screen.findByPlaceholderText('Subject')

    // Add a recipient to enable schedule
    const toInput = screen.getByPlaceholderText('Enter email addresses')
    await user.type(toInput, 'test@example.com{Enter}')

    await waitFor(() => {
      const scheduleBtn = screen.getByTitle('Schedule send')
      expect(scheduleBtn).not.toBeDisabled()
    })

    // Open the schedule picker
    await user.click(screen.getByTitle('Schedule send'))

    // ScheduleSendPicker should show preset options
    await waitFor(() => {
      // ScheduleSendPicker renders DateTimePicker with presets like "Later today"
      expect(screen.getByText(/later today/i)).toBeInTheDocument()
    })

    // Click the Cancel link inside the picker
    const cancelLink = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelLink)

    // Picker should close
    await waitFor(() => {
      expect(screen.queryByText(/later today/i)).not.toBeInTheDocument()
    })
  })
})
