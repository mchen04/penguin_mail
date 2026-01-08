import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Email, FolderType } from '@/types/email'
import { mockEmails } from '@/data/mockEmails'
import { ALL_ACCOUNTS_ID } from '@/constants'

interface EmailState {
  emails: Email[]
  currentFolder: FolderType
  currentAccountId: string // ALL_ACCOUNTS_ID or specific account id
  selectedEmailId: string | null
  selectedIds: Set<string>
}

type EmailAction =
  | { type: 'SET_FOLDER'; folder: FolderType }
  | { type: 'SET_ACCOUNT'; accountId: string }
  | { type: 'SELECT_EMAIL'; id: string | null }
  | { type: 'TOGGLE_STAR'; id: string }
  | { type: 'MARK_READ'; ids: string[] }
  | { type: 'MARK_UNREAD'; ids: string[] }
  | { type: 'DELETE'; ids: string[] }
  | { type: 'ARCHIVE'; ids: string[] }
  | { type: 'SET_SELECTION'; ids: Set<string> }
  | { type: 'CLEAR_SELECTION' }

const initialState: EmailState = {
  emails: mockEmails,
  currentFolder: 'inbox',
  currentAccountId: ALL_ACCOUNTS_ID,
  selectedEmailId: null,
  selectedIds: new Set(),
}

function emailReducer(state: EmailState, action: EmailAction): EmailState {
  switch (action.type) {
    case 'SET_FOLDER':
      return {
        ...state,
        currentFolder: action.folder,
        selectedEmailId: null,
        selectedIds: new Set(),
      }

    case 'SET_ACCOUNT':
      return {
        ...state,
        currentAccountId: action.accountId,
        selectedEmailId: null,
        selectedIds: new Set(),
      }

    case 'SELECT_EMAIL':
      return {
        ...state,
        selectedEmailId: action.id,
        // Mark as read when opening
        emails: action.id
          ? state.emails.map((email) =>
              email.id === action.id ? { ...email, isRead: true } : email
            )
          : state.emails,
      }

    case 'TOGGLE_STAR':
      return {
        ...state,
        emails: state.emails.map((email) =>
          email.id === action.id
            ? { ...email, isStarred: !email.isStarred }
            : email
        ),
      }

    case 'MARK_READ':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, isRead: true } : email
        ),
        selectedIds: new Set(),
      }

    case 'MARK_UNREAD':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, isRead: false } : email
        ),
        selectedIds: new Set(),
      }

    case 'DELETE':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, folder: 'trash' } : email
        ),
        selectedIds: new Set(),
      }

    case 'ARCHIVE':
      // For now, just move to trash (would be archive folder in real app)
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, folder: 'trash' } : email
        ),
        selectedIds: new Set(),
      }

    case 'SET_SELECTION':
      return {
        ...state,
        selectedIds: action.ids,
      }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedIds: new Set(),
      }

    default:
      return state
  }
}

interface EmailContextValue extends EmailState {
  filteredEmails: Email[]
  setFolder: (folder: FolderType) => void
  setAccount: (accountId: string) => void
  selectEmail: (id: string | null) => void
  toggleStar: (id: string) => void
  markRead: (ids: string[]) => void
  markUnread: (ids: string[]) => void
  deleteEmails: (ids: string[]) => void
  archiveEmails: (ids: string[]) => void
  setSelection: (ids: Set<string>) => void
  clearSelection: () => void
}

const EmailContext = createContext<EmailContextValue | null>(null)

export function EmailProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(emailReducer, initialState)

  // Filter emails from state (not static mock data) to reflect mutations
  const filteredEmails = useMemo(
    () =>
      state.emails.filter((email) => {
        const folderMatch = email.folder === state.currentFolder
        const accountMatch =
          state.currentAccountId === ALL_ACCOUNTS_ID || email.accountId === state.currentAccountId
        return folderMatch && accountMatch
      }),
    [state.emails, state.currentFolder, state.currentAccountId]
  )

  // Memoized action creators
  const setFolder = useCallback(
    (folder: FolderType) => dispatch({ type: 'SET_FOLDER', folder }),
    []
  )
  const setAccount = useCallback(
    (accountId: string) => dispatch({ type: 'SET_ACCOUNT', accountId }),
    []
  )
  const selectEmail = useCallback(
    (id: string | null) => dispatch({ type: 'SELECT_EMAIL', id }),
    []
  )
  const toggleStar = useCallback(
    (id: string) => dispatch({ type: 'TOGGLE_STAR', id }),
    []
  )
  const markRead = useCallback(
    (ids: string[]) => dispatch({ type: 'MARK_READ', ids }),
    []
  )
  const markUnread = useCallback(
    (ids: string[]) => dispatch({ type: 'MARK_UNREAD', ids }),
    []
  )
  const deleteEmails = useCallback(
    (ids: string[]) => dispatch({ type: 'DELETE', ids }),
    []
  )
  const archiveEmails = useCallback(
    (ids: string[]) => dispatch({ type: 'ARCHIVE', ids }),
    []
  )
  const setSelection = useCallback(
    (ids: Set<string>) => dispatch({ type: 'SET_SELECTION', ids }),
    []
  )
  const clearSelection = useCallback(
    () => dispatch({ type: 'CLEAR_SELECTION' }),
    []
  )

  // Memoized context value
  const value = useMemo<EmailContextValue>(
    () => ({
      ...state,
      filteredEmails,
      setFolder,
      setAccount,
      selectEmail,
      toggleStar,
      markRead,
      markUnread,
      deleteEmails,
      archiveEmails,
      setSelection,
      clearSelection,
    }),
    [
      state,
      filteredEmails,
      setFolder,
      setAccount,
      selectEmail,
      toggleStar,
      markRead,
      markUnread,
      deleteEmails,
      archiveEmails,
      setSelection,
      clearSelection,
    ]
  )

  return (
    <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEmail(): EmailContextValue {
  const context = useContext(EmailContext)
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider')
  }
  return context
}
