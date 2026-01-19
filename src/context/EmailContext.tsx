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
  lastSelectedId: string | null // For shift-click range selection
  searchQuery: string
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
  | { type: 'TOGGLE_SELECTION'; id: string }
  | { type: 'TOGGLE_SELECTION_RANGE'; id: string; filteredIds: string[] }
  | { type: 'SET_SEARCH'; query: string }

const initialState: EmailState = {
  emails: mockEmails,
  currentFolder: 'inbox',
  currentAccountId: ALL_ACCOUNTS_ID,
  selectedEmailId: null,
  selectedIds: new Set(),
  lastSelectedId: null,
  searchQuery: '',
}

function emailReducer(state: EmailState, action: EmailAction): EmailState {
  switch (action.type) {
    case 'SET_FOLDER':
      return {
        ...state,
        currentFolder: action.folder,
        selectedEmailId: null,
        selectedIds: new Set(),
        lastSelectedId: null,
        searchQuery: '', // Clear search when changing folder
      }

    case 'SET_ACCOUNT':
      return {
        ...state,
        currentAccountId: action.accountId,
        selectedEmailId: null,
        selectedIds: new Set(),
        lastSelectedId: null,
        searchQuery: '', // Clear search when changing account
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
        lastSelectedId: null,
      }

    case 'MARK_UNREAD':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, isRead: false } : email
        ),
        selectedIds: new Set(),
        lastSelectedId: null,
      }

    case 'DELETE':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, folder: 'trash' } : email
        ),
        selectedIds: new Set(),
        lastSelectedId: null,
      }

    case 'ARCHIVE':
      // For now, just move to trash (would be archive folder in real app)
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, folder: 'trash' } : email
        ),
        selectedIds: new Set(),
        lastSelectedId: null,
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
        lastSelectedId: null,
      }

    case 'TOGGLE_SELECTION': {
      const next = new Set(state.selectedIds)
      if (next.has(action.id)) {
        next.delete(action.id)
      } else {
        next.add(action.id)
      }
      return {
        ...state,
        selectedIds: next,
        lastSelectedId: action.id,
      }
    }

    case 'TOGGLE_SELECTION_RANGE': {
      const { id, filteredIds } = action
      const { lastSelectedId, selectedIds } = state

      // If no previous selection, just toggle single item
      if (!lastSelectedId) {
        const next = new Set(selectedIds)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return {
          ...state,
          selectedIds: next,
          lastSelectedId: id,
        }
      }

      // Find indices for range selection
      const startIndex = filteredIds.indexOf(lastSelectedId)
      const endIndex = filteredIds.indexOf(id)

      if (startIndex === -1 || endIndex === -1) {
        // Fallback: just toggle single item
        const next = new Set(selectedIds)
        next.add(id)
        return {
          ...state,
          selectedIds: next,
          lastSelectedId: id,
        }
      }

      // Select range
      const [from, to] = startIndex < endIndex
        ? [startIndex, endIndex]
        : [endIndex, startIndex]

      const next = new Set(selectedIds)
      for (let i = from; i <= to; i++) {
        next.add(filteredIds[i])
      }

      return {
        ...state,
        selectedIds: next,
        lastSelectedId: id,
      }
    }

    case 'SET_SEARCH':
      return {
        ...state,
        searchQuery: action.query,
        selectedIds: new Set(),
        lastSelectedId: null,
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
  toggleSelection: (id: string, shiftKey?: boolean) => void
  isSelected: (id: string) => boolean
  selectAll: () => void
  setSearch: (query: string) => void
  // Dynamic folder counts computed from actual email data
  getUnreadCount: (folder: FolderType, accountId?: string | null) => number
  getFolderCount: (folder: FolderType, accountId?: string | null) => number
  getTotalUnreadCount: () => number
}

const EmailContext = createContext<EmailContextValue | null>(null)

export function EmailProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(emailReducer, initialState)

  // Filter emails from state (not static mock data) to reflect mutations
  const filteredEmails = useMemo(() => {
    const query = state.searchQuery.toLowerCase().trim()

    return state.emails.filter((email) => {
      const folderMatch = email.folder === state.currentFolder
      const accountMatch =
        state.currentAccountId === ALL_ACCOUNTS_ID || email.accountId === state.currentAccountId

      // Search filter - match subject, from name/email, or preview
      const searchMatch =
        !query ||
        email.subject.toLowerCase().includes(query) ||
        email.from.name.toLowerCase().includes(query) ||
        email.from.email.toLowerCase().includes(query) ||
        email.preview.toLowerCase().includes(query)

      return folderMatch && accountMatch && searchMatch
    })
  }, [state.emails, state.currentFolder, state.currentAccountId, state.searchQuery])

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
  const setSearch = useCallback(
    (query: string) => dispatch({ type: 'SET_SEARCH', query }),
    []
  )

  // Selection helpers using filteredEmails for proper scoping
  const filteredIds = useMemo(
    () => filteredEmails.map((e) => e.id),
    [filteredEmails]
  )

  const toggleSelection = useCallback(
    (id: string, shiftKey = false) => {
      if (shiftKey) {
        dispatch({ type: 'TOGGLE_SELECTION_RANGE', id, filteredIds })
      } else {
        dispatch({ type: 'TOGGLE_SELECTION', id })
      }
    },
    [filteredIds]
  )

  const isSelected = useCallback(
    (id: string) => state.selectedIds.has(id),
    [state.selectedIds]
  )

  const selectAll = useCallback(() => {
    const allIds = new Set(filteredIds)
    dispatch({ type: 'SET_SELECTION', ids: allIds })
  }, [filteredIds])

  // Computed folder counts from actual email data
  const getUnreadCount = useCallback(
    (folder: FolderType, accountId?: string | null) => {
      return state.emails.filter((email) => {
        const folderMatch = email.folder === folder
        const accountMatch = !accountId || accountId === ALL_ACCOUNTS_ID || email.accountId === accountId
        return folderMatch && accountMatch && !email.isRead
      }).length
    },
    [state.emails]
  )

  const getFolderCount = useCallback(
    (folder: FolderType, accountId?: string | null) => {
      return state.emails.filter((email) => {
        const folderMatch = email.folder === folder
        const accountMatch = !accountId || accountId === ALL_ACCOUNTS_ID || email.accountId === accountId
        return folderMatch && accountMatch
      }).length
    },
    [state.emails]
  )

  const getTotalUnreadCount = useCallback(() => {
    return state.emails.filter((email) => email.folder === 'inbox' && !email.isRead).length
  }, [state.emails])

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
      toggleSelection,
      isSelected,
      selectAll,
      setSearch,
      getUnreadCount,
      getFolderCount,
      getTotalUnreadCount,
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
      toggleSelection,
      isSelected,
      selectAll,
      setSearch,
      getUnreadCount,
      getFolderCount,
      getTotalUnreadCount,
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
