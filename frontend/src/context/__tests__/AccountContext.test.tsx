import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import { AccountProvider, useAccounts } from '../AccountContext'
import { RepositoryProvider } from '../RepositoryContext'
import { createMockRepositories } from '@/test/mock-repositories'

const mockAccounts = [
  { id: 'acc-1', name: 'Work', email: 'work@example.com', provider: 'gmail', isDefault: true },
  { id: 'acc-2', name: 'Personal', email: 'personal@example.com', provider: 'outlook', isDefault: false },
]

function createWrapper() {
  const repos = createMockRepositories()
  repos.accounts.getAll = vi.fn().mockResolvedValue(mockAccounts)

  const wrapper = ({ children }: { children: ReactNode }) => (
    <RepositoryProvider repositories={repos}>
      <AccountProvider>{children}</AccountProvider>
    </RepositoryProvider>
  )

  return { repos, wrapper }
}

describe('AccountContext', () => {
  it('loads accounts on mount from repository', async () => {
    const { wrapper, repos } = createWrapper()
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => {
      expect(result.current.accounts).toEqual(mockAccounts)
    })

    expect(repos.accounts.getAll).toHaveBeenCalled()
  })

  it('selectAccount updates selectedAccountId', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => {
      expect(result.current.accounts.length).toBe(2)
    })

    act(() => {
      result.current.selectAccount('acc-1')
    })

    expect(result.current.selectedAccountId).toBe('acc-1')
  })

  it('selectFolder updates both accountId and folder', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => {
      expect(result.current.accounts.length).toBe(2)
    })

    act(() => {
      result.current.selectFolder('acc-2', 'sent')
    })

    expect(result.current.selectedAccountId).toBe('acc-2')
    expect(result.current.selectedFolder).toBe('sent')
  })

  it('toggleAccountExpanded toggles in expandedAccountIds set', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAccounts(), { wrapper })

    // After mount with SET_ACCOUNTS, all account ids are expanded
    await waitFor(() => {
      expect(result.current.accounts.length).toBe(2)
    })

    // acc-1 should be expanded after load
    expect(result.current.expandedAccountIds.has('acc-1')).toBe(true)

    // Toggle to collapse
    act(() => {
      result.current.toggleAccountExpanded('acc-1')
    })
    expect(result.current.expandedAccountIds.has('acc-1')).toBe(false)

    // Toggle to expand again
    act(() => {
      result.current.toggleAccountExpanded('acc-1')
    })
    expect(result.current.expandedAccountIds.has('acc-1')).toBe(true)
  })

  it('useAccounts throws outside provider', () => {
    expect(() => {
      renderHook(() => useAccounts())
    }).toThrow('useAccounts must be used within an AccountProvider')
  })
})
