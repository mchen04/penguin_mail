import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react'
import type { Account, FolderType } from '@/types/account'

// --------------------------------------------------------------------------
// Mock Data
// --------------------------------------------------------------------------

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'ucr',
    email: 'mchen023@ucr.edu',
    name: 'UCR',
    color: 'blue',
    folderCounts: { inbox: 4, drafts: 1, sent: 1, spam: 0, trash: 0 },
  },
  {
    id: 'personal',
    email: 'm.chen.dev@gmail.com',
    name: 'Personal',
    color: 'green',
    folderCounts: { inbox: 5, drafts: 0, sent: 1, spam: 1, trash: 0 },
  },
]

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface AccountState {
  accounts: Account[]
  expandedAccountIds: Set<string>
  selectedAccountId: string | null // null = "All accounts"
  selectedFolder: FolderType
}

type AccountAction =
  | { type: 'TOGGLE_ACCOUNT_EXPANDED'; payload: string }
  | { type: 'SET_SELECTED_ACCOUNT'; payload: string | null }
  | { type: 'SET_SELECTED_FOLDER'; payload: FolderType }
  | { type: 'SELECT_FOLDER'; payload: { accountId: string | null; folder: FolderType } }

interface AccountContextValue extends AccountState {
  toggleAccountExpanded: (accountId: string) => void
  selectAccount: (accountId: string | null) => void
  selectFolder: (accountId: string | null, folder: FolderType) => void
  getTotalUnread: () => number
  getAccountById: (id: string) => Account | undefined
}

// --------------------------------------------------------------------------
// Initial State
// --------------------------------------------------------------------------

const initialState: AccountState = {
  accounts: MOCK_ACCOUNTS,
  expandedAccountIds: new Set(['ucr']), // First account expanded by default
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
    (accountId: string | null, folder: FolderType) =>
      dispatch({ type: 'SELECT_FOLDER', payload: { accountId, folder } }),
    []
  )
  const getTotalUnread = useCallback(
    () => state.accounts.reduce((total, account) => total + account.folderCounts.inbox, 0),
    [state.accounts]
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
      getTotalUnread,
      getAccountById,
    }),
    [state, toggleAccountExpanded, selectAccount, selectFolder, getTotalUnread, getAccountById]
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
