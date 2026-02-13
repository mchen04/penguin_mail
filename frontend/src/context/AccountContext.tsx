import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { Account } from '@/types/account'
import type { SystemFolderType } from '@/types/email'
import { ALL_ACCOUNTS_ID } from '@/constants'
import { useRepositories } from './RepositoryContext'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface AccountState {
  accounts: Account[]
  expandedAccountIds: Set<string>
  selectedAccountId: string | null // null = "All accounts"
  selectedFolder: SystemFolderType
}

type AccountAction =
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'TOGGLE_ACCOUNT_EXPANDED'; payload: string }
  | { type: 'SET_SELECTED_ACCOUNT'; payload: string | null }
  | { type: 'SET_SELECTED_FOLDER'; payload: SystemFolderType }
  | { type: 'SELECT_FOLDER'; payload: { accountId: string | null; folder: SystemFolderType } }

interface AccountContextValue extends AccountState {
  toggleAccountExpanded: (accountId: string) => void
  selectAccount: (accountId: string | null) => void
  selectFolder: (accountId: string | null, folder: SystemFolderType) => void
  getAccountById: (id: string) => Account | undefined
}

// --------------------------------------------------------------------------
// Initial State
// --------------------------------------------------------------------------

const initialState: AccountState = {
  accounts: [],
  expandedAccountIds: new Set([ALL_ACCOUNTS_ID]),
  selectedAccountId: null, // "All accounts" selected by default
  selectedFolder: 'inbox',
}

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

function accountReducer(state: AccountState, action: AccountAction): AccountState {
  switch (action.type) {
    case 'SET_ACCOUNTS': {
      const ids = new Set([ALL_ACCOUNTS_ID, ...action.payload.map((a) => a.id)])
      return { ...state, accounts: action.payload, expandedAccountIds: ids }
    }
    case 'TOGGLE_ACCOUNT_EXPANDED': {
      const newExpanded = new Set(state.expandedAccountIds)
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload)
      } else {
        newExpanded.add(action.payload)
      }
      return { ...state, expandedAccountIds: newExpanded }
    }
    case 'SET_SELECTED_ACCOUNT':
      return { ...state, selectedAccountId: action.payload }
    case 'SET_SELECTED_FOLDER':
      return { ...state, selectedFolder: action.payload }
    case 'SELECT_FOLDER':
      return {
        ...state,
        selectedAccountId: action.payload.accountId,
        selectedFolder: action.payload.folder,
      }
    default:
      return state
  }
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

const AccountContext = createContext<AccountContextValue | null>(null)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(accountReducer, initialState)
  const { accounts: accountRepository } = useRepositories()

  // Fetch accounts from API on mount
  useEffect(() => {
    let cancelled = false
    async function loadAccounts() {
      try {
        const accounts = await accountRepository.getAll()
        if (!cancelled) {
          dispatch({ type: 'SET_ACCOUNTS', payload: accounts })
        }
      } catch {
        // Silently fail — accounts will remain empty
      }
    }
    loadAccounts()
    return () => { cancelled = true }
  }, [accountRepository])

  // Memoized action creators
  const toggleAccountExpanded = useCallback(
    (accountId: string) => dispatch({ type: 'TOGGLE_ACCOUNT_EXPANDED', payload: accountId }),
    []
  )
  const selectAccount = useCallback(
    (accountId: string | null) => dispatch({ type: 'SET_SELECTED_ACCOUNT', payload: accountId }),
    []
  )
  const selectFolder = useCallback(
    (accountId: string | null, folder: SystemFolderType) =>
      dispatch({ type: 'SELECT_FOLDER', payload: { accountId, folder } }),
    []
  )
  const getAccountById = useCallback(
    (id: string) => state.accounts.find((a) => a.id === id),
    [state.accounts]
  )

  // Memoized context value
  const value = useMemo<AccountContextValue>(
    () => ({
      ...state,
      toggleAccountExpanded,
      selectAccount,
      selectFolder,
      getAccountById,
    }),
    [state, toggleAccountExpanded, selectAccount, selectFolder, getAccountById]
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAccounts(): AccountContextValue {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider')
  }
  return context
}
