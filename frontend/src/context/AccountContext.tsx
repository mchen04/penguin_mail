import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react'
import type { Account } from '@/types/account'
import type { SystemFolderType } from '@/types/email'
import { ALL_ACCOUNTS_ID } from '@/constants'

// --------------------------------------------------------------------------
// Mock Data
// --------------------------------------------------------------------------

const now = new Date()
const daysAgo = (days: number): Date => {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return date
}

// Accounts without hardcoded folderCounts - counts come from EmailContext now
const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'ucr',
    email: 'mchen023@ucr.edu',
    name: 'UCR',
    color: 'blue',
    isDefault: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
  },
  {
    id: 'personal',
    email: 'm.chen.dev@gmail.com',
    name: 'Personal',
    color: 'green',
    isDefault: false,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(30),
  },
]

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
  accounts: MOCK_ACCOUNTS,
  expandedAccountIds: new Set([ALL_ACCOUNTS_ID, 'ucr']), // "All accounts" and first account expanded by default
  selectedAccountId: null, // "All accounts" selected by default
  selectedFolder: 'inbox',
}

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

function accountReducer(state: AccountState, action: AccountAction): AccountState {
  switch (action.type) {
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
