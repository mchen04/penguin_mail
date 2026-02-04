/**
 * Repository Context
 * Provides data repositories to the application via React Context
 * Enables clean separation between UI and data layer
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { IRepositories } from '@/repositories/types'
import { createMockRepositories } from '@/repositories'

const RepositoryContext = createContext<IRepositories | null>(null)

interface RepositoryProviderProps {
  children: ReactNode
  repositories?: IRepositories
}

/**
 * Provides repository instances to the application
 * Can accept custom repositories for testing or different backends
 */
export function RepositoryProvider({ children, repositories }: RepositoryProviderProps) {
  const repos = useMemo(() => {
    return repositories ?? createMockRepositories()
  }, [repositories])

  return (
    <RepositoryContext.Provider value={repos}>
      {children}
    </RepositoryContext.Provider>
  )
}

/**
 * Hook to access all repositories
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useRepositories(): IRepositories {
  const context = useContext(RepositoryContext)
  if (!context) {
    throw new Error('useRepositories must be used within a RepositoryProvider')
  }
  return context
}
