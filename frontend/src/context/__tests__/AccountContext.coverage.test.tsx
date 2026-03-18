/**
 * Additional coverage tests for AccountContext — addAccount, deleteAccount,
 * getAccountById, and error branches.
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { AccountProvider, useAccounts } from '../AccountContext'
import { RepositoryProvider } from '../RepositoryContext'
import { createMockRepositories } from '@/test/mock-repositories'

const mockAccounts = [
  { id: 'acc-1', name: 'Work', email: 'work@example.com', provider: 'gmail', isDefault: true },
  { id: 'acc-2', name: 'Personal', email: 'personal@example.com', provider: 'outlook', isDefault: false },
]

function createWrapper(repoOverrides?: (repos: ReturnType<typeof createMockRepositories>) => void) {
  const repos = createMockRepositories()
  repos.accounts.getAll = vi.fn().mockResolvedValue(mockAccounts)
  if (repoOverrides) repoOverrides(repos)

  const wrapper = ({ children }: { children: ReactNode }) => (
    <RepositoryProvider repositories={repos}>
      <AccountProvider>{children}</AccountProvider>
    </RepositoryProvider>
  )

  return { repos, wrapper }
}

describe('AccountContext — addAccount', () => {
  it('adds an account and reloads accounts on success', async () => {
    const newAccount = { id: 'acc-3', name: 'New', email: 'new@test.com', provider: 'zoho', isDefault: false }
    const { wrapper, repos } = createWrapper((r) => {
      r.accounts.create = vi.fn().mockResolvedValue({ success: true, data: newAccount })
      // After create, getAll returns the updated list
      r.accounts.getAll = vi.fn()
        .mockResolvedValueOnce(mockAccounts)
        .mockResolvedValueOnce([...mockAccounts, newAccount])
    })
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => expect(result.current.accounts.length).toBe(2))

    await act(async () => {
      await result.current.addAccount({
        email: 'new@test.com',
        name: 'New',
        color: 'green',
        provider: 'zoho',
        password: 'secret',
      })
    })

    await waitFor(() => expect(result.current.accounts.length).toBe(3))
    expect(repos.accounts.create).toHaveBeenCalled()
  })

  it('throws when addAccount fails', async () => {
    const { wrapper } = createWrapper((r) => {
      r.accounts.create = vi.fn().mockResolvedValue({ success: false, error: 'Duplicate email' })
    })
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => expect(result.current.accounts.length).toBe(2))

    await expect(
      act(async () => {
        await result.current.addAccount({
          email: 'dup@test.com',
          name: 'Dup',
          color: 'blue',
          provider: 'gmail',
          password: 'secret',
        })
      })
    ).rejects.toThrow('Duplicate email')
  })
})

describe('AccountContext — deleteAccount', () => {
  it('removes account from state on success', async () => {
    const { wrapper, repos } = createWrapper((r) => {
      r.accounts.delete = vi.fn().mockResolvedValue({ success: true, data: undefined })
    })
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => expect(result.current.accounts.length).toBe(2))

    await act(async () => {
      await result.current.deleteAccount('acc-1')
    })

    expect(result.current.accounts.length).toBe(1)
    expect(result.current.accounts[0].id).toBe('acc-2')
    expect(repos.accounts.delete).toHaveBeenCalledWith('acc-1')
  })

  it('throws when deleteAccount fails', async () => {
    const { wrapper } = createWrapper((r) => {
      r.accounts.delete = vi.fn().mockResolvedValue({ success: false, error: 'Not found' })
    })
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => expect(result.current.accounts.length).toBe(2))

    await expect(
      act(async () => {
        await result.current.deleteAccount('acc-999')
      })
    ).rejects.toThrow('Not found')
  })
})

describe('AccountContext — getAccountById', () => {
  it('returns the correct account', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => expect(result.current.accounts.length).toBe(2))

    expect(result.current.getAccountById('acc-1')).toEqual(
      expect.objectContaining({ id: 'acc-1', email: 'work@example.com' })
    )
  })

  it('returns undefined for non-existent id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => expect(result.current.accounts.length).toBe(2))

    expect(result.current.getAccountById('non-existent')).toBeUndefined()
  })
})

describe('AccountContext — load error handling', () => {
  it('silently handles error when loading accounts fails', async () => {
    const { wrapper } = createWrapper((r) => {
      r.accounts.getAll = vi.fn().mockRejectedValue(new Error('Network error'))
    })
    const { result } = renderHook(() => useAccounts(), { wrapper })

    // Should remain with empty accounts, no crash
    await waitFor(() => {
      expect(result.current.accounts).toEqual([])
    })
  })
})
