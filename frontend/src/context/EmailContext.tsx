import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import type { Email, FolderType, ComposeEmailInput, SearchFilters } from '@/types/email'
import { useRepositories } from './RepositoryContext'
import { postEmail } from '@/services/api'
import { stripHtml } from '@/utils'
import { ALL_ACCOUNTS_ID, DATE_RANGE_MS, REPOSITORY, TEXT } from '@/constants'

export type SortField = 'date' | 'sender' | 'subject'
export type SortDirection = 'asc' | 'desc'

// Re-export SearchFilters for backward compatibility
export type { SearchFilters } from '@/types/email'

const defaultSearchFilters: SearchFilters = {
  text: '',
  from: '',
  to: '',
  subject: '',
  hasAttachment: null,
  isUnread: null,
  isStarred: null,
  dateRange: 'any',
}

interface EmailState {
  emails: Email[]
  currentFolder: FolderType
  currentAccountId: string // ALL_ACCOUNTS_ID or specific account id
  selectedEmailId: string | null
  selectedIds: Set<string>
  lastSelectedId: string | null // For shift-click range selection
  searchQuery: string
  searchFilters: SearchFilters
  sortField: SortField
  sortDirection: SortDirection
  isLoading: boolean
}

type EmailAction =
  | { type: 'SET_EMAILS'; emails: Email[] }
  | { type: 'SET_FOLDER'; folder: FolderType }
  | { type: 'SET_ACCOUNT'; accountId: string }
  | { type: 'SELECT_EMAIL'; id: string | null }
  | { type: 'TOGGLE_STAR'; id: string }
  | { type: 'MARK_READ'; ids: string[] }
  | { type: 'MARK_UNREAD'; ids: string[] }
  | { type: 'DELETE'; ids: string[] }
  | { type: 'DELETE_PERMANENTLY'; ids: string[] }
  | { type: 'EMPTY_FOLDER'; folder: FolderType }
  | { type: 'ARCHIVE'; ids: string[] }
  | { type: 'MOVE_TO_FOLDER'; ids: string[]; folder: FolderType }
  | { type: 'SET_SELECTION'; ids: Set<string> }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_SELECTION'; id: string }
  | { type: 'TOGGLE_SELECTION_RANGE'; id: string; filteredIds: string[] }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_SEARCH_FILTERS'; filters: SearchFilters }
  | { type: 'SET_SORT'; field: SortField; direction: SortDirection }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'ADD_EMAIL'; email: Email }
  | { type: 'UPDATE_EMAIL'; id: string; updates: Partial<Email> }
  | { type: 'SNOOZE_EMAILS'; ids: string[]; snoozeUntil: Date }
  | { type: 'UNSNOOZE_EMAIL'; id: string }

const initialState: EmailState = {
  emails: [],
  currentFolder: 'inbox',
  currentAccountId: ALL_ACCOUNTS_ID,
  selectedEmailId: null,
  selectedIds: new Set(),
  lastSelectedId: null,
  searchQuery: '',
  searchFilters: { ...defaultSearchFilters },
  sortField: 'date',
  sortDirection: 'desc',
  isLoading: true,
}

function emailReducer(state: EmailState, action: EmailAction): EmailState {
  switch (action.type) {
    case 'SET_EMAILS':
      return { ...state, emails: action.emails, isLoading: false }

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

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
        // Clear selection if currently selected email was deleted
        selectedEmailId: action.ids.includes(state.selectedEmailId ?? '')
          ? null
          : state.selectedEmailId,
      }

    case 'DELETE_PERMANENTLY':
      return {
        ...state,
        emails: state.emails.filter((email) => !action.ids.includes(email.id)),
        selectedIds: new Set(),
        lastSelectedId: null,
        selectedEmailId: action.ids.includes(state.selectedEmailId ?? '')
          ? null
          : state.selectedEmailId,
      }

    case 'EMPTY_FOLDER':
      return {
        ...state,
        emails: state.emails.filter((email) => email.folder !== action.folder),
        selectedIds: new Set(),
        lastSelectedId: null,
        selectedEmailId: null,
      }

    case 'ARCHIVE':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, folder: 'archive' } : email
        ),
        selectedIds: new Set(),
        lastSelectedId: null,
        selectedEmailId: action.ids.includes(state.selectedEmailId ?? '')
          ? null
          : state.selectedEmailId,
      }

    case 'MOVE_TO_FOLDER':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id) ? { ...email, folder: action.folder } : email
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

    case 'SET_SEARCH_FILTERS':
      return {
        ...state,
        searchFilters: action.filters,
        searchQuery: action.filters.text, // Sync simple search with filters text
        selectedIds: new Set(),
        lastSelectedId: null,
      }

    case 'SET_SORT':
      return {
        ...state,
        sortField: action.field,
        sortDirection: action.direction,
      }

    case 'ADD_EMAIL':
      return {
        ...state,
        emails: [action.email, ...state.emails],
      }

    case 'UPDATE_EMAIL':
      return {
        ...state,
        emails: state.emails.map((email) =>
          email.id === action.id ? { ...email, ...action.updates } : email
        ),
      }

    case 'SNOOZE_EMAILS':
      return {
        ...state,
        emails: state.emails.map((email) =>
          action.ids.includes(email.id)
            ? {
                ...email,
                folder: 'snoozed' as FolderType,
                snoozeUntil: action.snoozeUntil,
                snoozedFromFolder: email.folder,
              }
            : email
        ),
        selectedIds: new Set(),
        lastSelectedId: null,
        selectedEmailId: action.ids.includes(state.selectedEmailId ?? '')
          ? null
          : state.selectedEmailId,
      }

    case 'UNSNOOZE_EMAIL': {
      const email = state.emails.find((e) => e.id === action.id)
      return {
        ...state,
        emails: state.emails.map((e) =>
          e.id === action.id
            ? {
                ...e,
                folder: e.snoozedFromFolder ?? 'inbox',
                snoozeUntil: undefined,
                snoozedFromFolder: undefined,
              }
            : e
        ),
        selectedEmailId:
          email?.folder === 'snoozed' && state.selectedEmailId === action.id
            ? null
            : state.selectedEmailId,
      }
    }

    default:
      return state
  }
}

interface EmailContextValue extends Omit<EmailState, 'isLoading'> {
  isLoading: boolean
  filteredEmails: Email[]
  setFolder: (folder: FolderType) => void
  setAccount: (accountId: string) => void
  selectEmail: (id: string | null) => void
  toggleStar: (id: string) => void
  markRead: (ids: string[]) => void
  markUnread: (ids: string[]) => void
  deleteEmails: (ids: string[]) => void
  deletePermanently: (ids: string[]) => void
  emptyFolder: (folder: FolderType) => void
  archiveEmails: (ids: string[]) => void
  moveToFolder: (ids: string[], folder: FolderType) => void
  markAsSpam: (ids: string[]) => void
  markNotSpam: (ids: string[]) => void
  setSelection: (ids: Set<string>) => void
  clearSelection: () => void
  toggleSelection: (id: string, shiftKey?: boolean) => void
  isSelected: (id: string) => boolean
  selectAll: () => void
  setSearch: (query: string) => void
  setSearchFilters: (filters: SearchFilters) => void
  setSort: (field: SortField, direction: SortDirection) => void
  toggleSortDirection: () => void
  // Dynamic folder counts computed from actual email data
  getUnreadCount: (folder: FolderType, accountId?: string | null) => number
  getFolderCount: (folder: FolderType, accountId?: string | null) => number
  getTotalUnreadCount: () => number
  // New methods for compose
  sendEmail: (email: ComposeEmailInput) => Promise<void>
  saveDraft: (email: Partial<ComposeEmailInput>) => Promise<void>
  // Label management
  addLabels: (ids: string[], labelIds: string[]) => void
  removeLabels: (ids: string[], labelIds: string[]) => void
  // Snooze
  snoozeEmails: (ids: string[], snoozeUntil: Date) => void
  unsnoozeEmail: (id: string) => void
  // Scheduled send
  scheduleEmail: (email: ComposeEmailInput, scheduledAt: Date) => Promise<void>
  cancelScheduledEmail: (id: string) => void
  getScheduledEmails: () => Email[]
  getSnoozedEmails: () => Email[]
}

const EmailContext = createContext<EmailContextValue | null>(null)

export function EmailProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(emailReducer, initialState)
  const { emails: emailRepository } = useRepositories()

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Load emails from repository on mount
  useEffect(() => {
    let cancelled = false

    async function loadEmails() {
      try {
        // Load all emails - use search with no filters to get everything
        const allEmails = await emailRepository.search({}, { page: 1, pageSize: REPOSITORY.LOAD_ALL_PAGE_SIZE })
        // Check if still mounted before updating state
        if (!cancelled && isMountedRef.current) {
          dispatch({ type: 'SET_EMAILS', emails: allEmails.data })
        }
      } catch {
        if (!cancelled && isMountedRef.current) {
          dispatch({ type: 'SET_LOADING', loading: false })
        }
      }
    }
    loadEmails()

    return () => {
      cancelled = true
    }
  }, [emailRepository])

  // Sync operations through repository - the repository handles persistence
  // State updates trigger re-renders, repository methods persist changes

  // Helper function to check if email date matches the date range filter
  const matchesDateRange = useCallback((emailDate: Date, dateRange: SearchFilters['dateRange'], dateFrom?: Date, dateTo?: Date) => {
    if (dateRange === 'any') return true

    const now = new Date()
    const emailTime = new Date(emailDate).getTime()

    if (dateRange === 'custom') {
      if (dateFrom && emailTime < dateFrom.getTime()) return false
      if (dateTo && emailTime > dateTo.getTime()) return false
      return true
    }

    // Calculate date range boundaries
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayTime = today.getTime()

    switch (dateRange) {
      case 'today':
        return emailTime >= todayTime
      case 'week':
        return emailTime >= todayTime - DATE_RANGE_MS.WEEK
      case 'month':
        return emailTime >= todayTime - DATE_RANGE_MS.MONTH
      case 'year':
        return emailTime >= todayTime - DATE_RANGE_MS.YEAR
      default:
        return true
    }
  }, [])

  // Filter emails from state (not static mock data) to reflect mutations
  const filteredEmails = useMemo(() => {
    const { text, from, to, subject, hasAttachment, isUnread, isStarred, dateRange, dateFrom, dateTo } = state.searchFilters
    const query = text.toLowerCase().trim()
    const fromFilter = from.toLowerCase().trim()
    const toFilter = to.toLowerCase().trim()
    const subjectFilter = subject.toLowerCase().trim()

    return state.emails.filter((email) => {
      // Handle starred as a virtual folder
      if (state.currentFolder === 'starred') {
        if (!email.isStarred) return false
        // Don't show starred emails that are in trash or spam
        if (email.folder === 'trash' || email.folder === 'spam') return false
      } else {
        if (email.folder !== state.currentFolder) return false
      }

      const accountMatch =
        state.currentAccountId === ALL_ACCOUNTS_ID || email.accountId === state.currentAccountId

      // Basic text search filter - match subject, from name/email, or preview
      const searchMatch =
        !query ||
        email.subject.toLowerCase().includes(query) ||
        email.from.name.toLowerCase().includes(query) ||
        email.from.email.toLowerCase().includes(query) ||
        email.preview.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)

      // From filter
      const fromMatch = !fromFilter ||
        email.from.email.toLowerCase().includes(fromFilter) ||
        email.from.name.toLowerCase().includes(fromFilter)

      // To filter
      const toMatch = !toFilter ||
        email.to.some(r => r.email.toLowerCase().includes(toFilter) || r.name.toLowerCase().includes(toFilter))

      // Subject filter
      const subjectMatch = !subjectFilter || email.subject.toLowerCase().includes(subjectFilter)

      // Has attachment filter
      const attachmentMatch = hasAttachment === null || email.hasAttachment === hasAttachment

      // Unread filter
      const unreadMatch = isUnread === null || !email.isRead === isUnread

      // Starred filter
      const starredMatch = isStarred === null || email.isStarred === isStarred

      // Date range filter
      const dateMatch = matchesDateRange(email.date, dateRange, dateFrom, dateTo)

      return accountMatch && searchMatch && fromMatch && toMatch && subjectMatch &&
             attachmentMatch && unreadMatch && starredMatch && dateMatch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [state.emails, state.currentFolder, state.currentAccountId, state.searchFilters, matchesDateRange])

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
    (id: string) => {
      dispatch({ type: 'TOGGLE_STAR', id })
      emailRepository.toggleStar([id])
    },
    [emailRepository]
  )
  const markRead = useCallback(
    (ids: string[]) => {
      dispatch({ type: 'MARK_READ', ids })
      emailRepository.markAsRead(ids)
    },
    [emailRepository]
  )
  const markUnread = useCallback(
    (ids: string[]) => {
      dispatch({ type: 'MARK_UNREAD', ids })
      emailRepository.markAsUnread(ids)
    },
    [emailRepository]
  )
  const deleteEmails = useCallback(
    (ids: string[]) => {
      dispatch({ type: 'DELETE', ids })
      emailRepository.deleteMany(ids)
    },
    [emailRepository]
  )
  const deletePermanently = useCallback(
    (ids: string[]) => {
      dispatch({ type: 'DELETE_PERMANENTLY', ids })
      emailRepository.deletePermanentlyMany(ids)
    },
    [emailRepository]
  )
  const emptyFolder = useCallback(
    (folder: FolderType) => {
      const idsToDelete = state.emails.filter((e) => e.folder === folder).map((e) => e.id)
      dispatch({ type: 'EMPTY_FOLDER', folder })
      emailRepository.deletePermanentlyMany(idsToDelete)
    },
    [emailRepository, state.emails]
  )
  const archiveEmails = useCallback(
    (ids: string[]) => {
      dispatch({ type: 'ARCHIVE', ids })
      emailRepository.archive(ids)
    },
    [emailRepository]
  )
  const moveToFolder = useCallback(
    (ids: string[], folder: FolderType) => {
      dispatch({ type: 'MOVE_TO_FOLDER', ids, folder })
      emailRepository.moveToFolder(ids, folder)
    },
    [emailRepository]
  )
  const markAsSpam = useCallback(
    (ids: string[]) => {
      dispatch({ type: 'MOVE_TO_FOLDER', ids, folder: 'spam' })
      emailRepository.markAsSpam(ids)
    },
    [emailRepository]
  )
  const markNotSpam = useCallback(
    (ids: string[]) => {
      dispatch({ type: 'MOVE_TO_FOLDER', ids, folder: 'inbox' })
      emailRepository.moveToFolder(ids, 'inbox')
    },
    [emailRepository]
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
  const setSearchFilters = useCallback(
    (filters: SearchFilters) => dispatch({ type: 'SET_SEARCH_FILTERS', filters }),
    []
  )
  const setSort = useCallback(
    (field: SortField, direction: SortDirection) =>
      dispatch({ type: 'SET_SORT', field, direction }),
    []
  )
  const toggleSortDirection = useCallback(
    () =>
      dispatch({
        type: 'SET_SORT',
        field: state.sortField,
        direction: state.sortDirection === 'asc' ? 'desc' : 'asc',
      }),
    [state.sortField, state.sortDirection]
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
        const folderMatch = folder === 'starred' ? email.isStarred : email.folder === folder
        const accountMatch = !accountId || accountId === ALL_ACCOUNTS_ID || email.accountId === accountId
        return folderMatch && accountMatch && !email.isRead
      }).length
    },
    [state.emails]
  )

  const getFolderCount = useCallback(
    (folder: FolderType, accountId?: string | null) => {
      return state.emails.filter((email) => {
        const folderMatch = folder === 'starred' ? email.isStarred : email.folder === folder
        const accountMatch = !accountId || accountId === ALL_ACCOUNTS_ID || email.accountId === accountId
        return folderMatch && accountMatch
      }).length
    },
    [state.emails]
  )

  const getTotalUnreadCount = useCallback(() => {
    return state.emails.filter((email) => email.folder === 'inbox' && !email.isRead).length
  }, [state.emails])

  // Send email (move from drafts to sent or create new sent email)
  const sendEmail = useCallback(async (email: ComposeEmailInput) => {
    // If it's an existing draft being sent, update via repository
    if (email.isDraft && email.id) {
      const newEmail: Email = {
        id: email.id,
        accountId: email.accountId,
        accountColor: email.accountColor ?? 'green',
        from: email.from ?? { name: 'User', email: 'user@example.com' },
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        preview: stripHtml(email.body).substring(0, TEXT.EMAIL_PREVIEW_LENGTH),
        body: email.body,
        date: new Date(),
        isRead: true,
        isStarred: false,
        hasAttachment: (email.attachments?.length ?? 0) > 0,
        attachments: email.attachments ?? [],
        folder: 'sent',
        labels: [],
        threadId: email.threadId ?? `thread-${Date.now()}`,
        replyToId: email.replyToId,
        forwardedFromId: email.forwardedFromId,
        isDraft: false,
      }
      dispatch({ type: 'UPDATE_EMAIL', id: email.id, updates: { ...newEmail, folder: 'sent', isDraft: false } })
      await emailRepository.update(email.id, { folder: 'sent' })
      return
    }

    // For new sends, post to backend API and update local state
    try {
      const resp = await postEmail(email)
      // resp should include id and timestamp
      const created: Email = {
        id: resp.id ?? `email-${Date.now()}`,
        accountId: email.accountId,
        accountColor: email.accountColor ?? 'green',
        from: email.from ?? { name: 'User', email: 'user@example.com' },
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        preview: stripHtml(email.body).substring(0, TEXT.EMAIL_PREVIEW_LENGTH),
        body: email.body,
        date: resp.timestamp ? new Date(resp.timestamp) : new Date(),
        isRead: true,
        isStarred: false,
        hasAttachment: (email.attachments?.length ?? 0) > 0,
        attachments: email.attachments ?? [],
        folder: 'sent',
        labels: [],
        threadId: email.threadId ?? `thread-${Date.now()}`,
        replyToId: email.replyToId,
        forwardedFromId: email.forwardedFromId,
        isDraft: false,
      }

      dispatch({ type: 'ADD_EMAIL', email: created })
    } catch (err) {
      // Fallback to local repository create when backend fails
      const fallback: Email = {
        id: email.id ?? `email-${Date.now()}`,
        accountId: email.accountId,
        accountColor: email.accountColor ?? 'green',
        from: email.from ?? { name: 'User', email: 'user@example.com' },
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        preview: stripHtml(email.body).substring(0, TEXT.EMAIL_PREVIEW_LENGTH),
        body: email.body,
        date: new Date(),
        isRead: true,
        isStarred: false,
        hasAttachment: (email.attachments?.length ?? 0) > 0,
        attachments: email.attachments ?? [],
        folder: 'sent',
        labels: [],
        threadId: email.threadId ?? `thread-${Date.now()}`,
        replyToId: email.replyToId,
        forwardedFromId: email.forwardedFromId,
        isDraft: false,
      }

      dispatch({ type: 'ADD_EMAIL', email: fallback })
      await emailRepository.create({
        accountId: fallback.accountId,
        to: fallback.to,
        cc: fallback.cc,
        bcc: fallback.bcc,
        subject: fallback.subject,
        body: fallback.body,
        attachments: fallback.attachments,
        replyToId: fallback.replyToId,
        forwardedFromId: fallback.forwardedFromId,
      })
    }
  }, [emailRepository])

  // Save draft
  const saveDraft = useCallback(async (email: Partial<ComposeEmailInput>) => {
    const result = await emailRepository.saveDraft(email)
    // Check if still mounted before updating state
    if (result.success && isMountedRef.current) {
      if (email.id) {
        dispatch({ type: 'UPDATE_EMAIL', id: email.id, updates: result.data })
      } else {
        dispatch({ type: 'ADD_EMAIL', email: result.data })
      }
    }
  }, [emailRepository])

  // Add labels to emails
  const addLabels = useCallback(
    (ids: string[], labelIds: string[]) => {
      for (const id of ids) {
        const email = state.emails.find((e) => e.id === id)
        if (email) {
          const newLabels = [...new Set([...email.labels, ...labelIds])]
          dispatch({ type: 'UPDATE_EMAIL', id, updates: { labels: newLabels } })
        }
      }
      emailRepository.addLabels(ids, labelIds)
    },
    [state.emails, emailRepository]
  )

  // Remove labels from emails
  const removeLabels = useCallback(
    (ids: string[], labelIds: string[]) => {
      for (const id of ids) {
        const email = state.emails.find((e) => e.id === id)
        if (email) {
          const newLabels = email.labels.filter((l) => !labelIds.includes(l))
          dispatch({ type: 'UPDATE_EMAIL', id, updates: { labels: newLabels } })
        }
      }
      emailRepository.removeLabels(ids, labelIds)
    },
    [state.emails, emailRepository]
  )

  // Snooze emails
  const snoozeEmails = useCallback(
    (ids: string[], snoozeUntil: Date) => {
      dispatch({ type: 'SNOOZE_EMAILS', ids, snoozeUntil })
      // Persist the snooze via repository
      for (const id of ids) {
        const email = state.emails.find((e) => e.id === id)
        if (email) {
          emailRepository.update(id, {
            folder: 'snoozed' as FolderType,
          })
        }
      }
    },
    [state.emails, emailRepository]
  )

  // Unsnooze email
  const unsnoozeEmail = useCallback(
    (id: string) => {
      const email = state.emails.find((e) => e.id === id)
      dispatch({ type: 'UNSNOOZE_EMAIL', id })
      if (email) {
        emailRepository.update(id, {
          folder: email.snoozedFromFolder ?? 'inbox',
        })
      }
    },
    [state.emails, emailRepository]
  )

  // Schedule email to be sent later
  const scheduleEmail = useCallback(async (email: ComposeEmailInput, scheduledAt: Date) => {
    const newEmail: Email = {
      id: email.id ?? `email-${Date.now()}`,
      accountId: email.accountId,
      accountColor: email.accountColor ?? 'green',
      from: email.from ?? { name: 'User', email: 'user@example.com' },
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      preview: stripHtml(email.body).substring(0, TEXT.EMAIL_PREVIEW_LENGTH),
      body: email.body,
      date: new Date(),
      isRead: true,
      isStarred: false,
      hasAttachment: (email.attachments?.length ?? 0) > 0,
      attachments: email.attachments ?? [],
      folder: 'scheduled' as FolderType,
      labels: [],
      threadId: email.threadId ?? `thread-${Date.now()}`,
      replyToId: email.replyToId,
      forwardedFromId: email.forwardedFromId,
      isDraft: false,
      scheduledSendAt: scheduledAt,
    }

    // If updating an existing draft, update it
    if (email.isDraft && email.id) {
      dispatch({ type: 'UPDATE_EMAIL', id: email.id, updates: { ...newEmail, folder: 'scheduled' as FolderType } })
      await emailRepository.update(email.id, { folder: 'scheduled' as FolderType })
    } else {
      dispatch({ type: 'ADD_EMAIL', email: newEmail })
      await emailRepository.create({
        accountId: newEmail.accountId,
        to: newEmail.to,
        cc: newEmail.cc,
        bcc: newEmail.bcc,
        subject: newEmail.subject,
        body: newEmail.body,
        attachments: newEmail.attachments,
        replyToId: newEmail.replyToId,
        forwardedFromId: newEmail.forwardedFromId,
        scheduledSendAt: scheduledAt,
      })
    }
  }, [emailRepository])

  // Cancel scheduled email (move back to drafts)
  const cancelScheduledEmail = useCallback(
    (id: string) => {
      dispatch({ type: 'UPDATE_EMAIL', id, updates: { folder: 'drafts', scheduledSendAt: undefined, isDraft: true } })
      emailRepository.update(id, { folder: 'drafts' })
    },
    [emailRepository]
  )

  // Get scheduled emails
  const getScheduledEmails = useCallback(() => {
    return state.emails.filter((e) => e.folder === 'scheduled' && e.scheduledSendAt)
  }, [state.emails])

  // Get snoozed emails
  const getSnoozedEmails = useCallback(() => {
    return state.emails.filter((e) => e.folder === 'snoozed' && e.snoozeUntil)
  }, [state.emails])

  // Check for snoozed emails that need to be unsnoozed
  useEffect(() => {
    const checkSnooze = () => {
      const now = new Date()
      const snoozedEmails = state.emails.filter(
        (e) => e.folder === 'snoozed' && e.snoozeUntil && new Date(e.snoozeUntil) <= now
      )
      for (const email of snoozedEmails) {
        unsnoozeEmail(email.id)
      }
    }

    // Check immediately on mount
    checkSnooze()

    // Check every minute
    const interval = setInterval(checkSnooze, 60000)
    return () => clearInterval(interval)
  }, [state.emails, unsnoozeEmail])

  // Check for scheduled emails that need to be sent
  useEffect(() => {
    const checkScheduled = () => {
      const now = new Date()
      const scheduledEmails = state.emails.filter(
        (e) => e.folder === 'scheduled' && e.scheduledSendAt && new Date(e.scheduledSendAt) <= now
      )
      for (const email of scheduledEmails) {
        // Move to sent folder
        dispatch({ type: 'UPDATE_EMAIL', id: email.id, updates: { folder: 'sent', scheduledSendAt: undefined } })
        emailRepository.update(email.id, { folder: 'sent' })
      }
    }

    // Check immediately on mount
    checkScheduled()

    // Check every minute
    const interval = setInterval(checkScheduled, 60000)
    return () => clearInterval(interval)
  }, [state.emails, emailRepository])

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
      deletePermanently,
      emptyFolder,
      archiveEmails,
      moveToFolder,
      markAsSpam,
      markNotSpam,
      setSelection,
      clearSelection,
      toggleSelection,
      isSelected,
      selectAll,
      setSearch,
      setSearchFilters,
      setSort,
      toggleSortDirection,
      getUnreadCount,
      getFolderCount,
      getTotalUnreadCount,
      sendEmail,
      saveDraft,
      addLabels,
      removeLabels,
      snoozeEmails,
      unsnoozeEmail,
      scheduleEmail,
      cancelScheduledEmail,
      getScheduledEmails,
      getSnoozedEmails,
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
      deletePermanently,
      emptyFolder,
      archiveEmails,
      moveToFolder,
      markAsSpam,
      markNotSpam,
      setSelection,
      clearSelection,
      toggleSelection,
      isSelected,
      selectAll,
      setSearch,
      setSearchFilters,
      setSort,
      toggleSortDirection,
      getUnreadCount,
      getFolderCount,
      getTotalUnreadCount,
      sendEmail,
      saveDraft,
      addLabels,
      removeLabels,
      snoozeEmails,
      unsnoozeEmail,
      scheduleEmail,
      cancelScheduledEmail,
      getScheduledEmails,
      getSnoozedEmails,
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
