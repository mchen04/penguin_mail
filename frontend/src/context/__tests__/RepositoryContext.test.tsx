import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RepositoryProvider, useRepositories } from '../RepositoryContext'
import { createMockRepositories } from '@/test/mock-repositories'

describe('RepositoryContext', () => {
  it('provides repositories to children', () => {
    const repos = createMockRepositories()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RepositoryProvider repositories={repos}>
        {children}
      </RepositoryProvider>
    )

    const { result } = renderHook(() => useRepositories(), { wrapper })

    expect(result.current).toBe(repos)
  })

  it('useRepositories returns all repository interfaces', () => {
    const repos = createMockRepositories()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RepositoryProvider repositories={repos}>
        {children}
      </RepositoryProvider>
    )

    const { result } = renderHook(() => useRepositories(), { wrapper })

    expect(result.current.accounts).toBeDefined()
    expect(result.current.emails).toBeDefined()
    expect(result.current.contacts).toBeDefined()
    expect(result.current.contactGroups).toBeDefined()
    expect(result.current.settings).toBeDefined()
    expect(result.current.folders).toBeDefined()
    expect(result.current.labels).toBeDefined()
  })

  it('useRepositories throws outside provider', () => {
    expect(() => {
      renderHook(() => useRepositories())
    }).toThrow('useRepositories must be used within a RepositoryProvider')
  })
})
