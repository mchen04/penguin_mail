import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Theme, Density } from '@/types/settings'
import type { Email, EmailAddress } from '@/types/email'
import { STORAGE_KEYS, DATA_ATTRIBUTES } from '@/constants'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type ComposeState = 'closed' | 'minimized' | 'open' | 'maximized'
type AppView = 'mail' | 'contacts'
type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward' | 'editDraft'

export interface ComposeData {
  mode: ComposeMode
  originalEmail?: Email
  draftId?: string
  to?: EmailAddress[]
  cc?: EmailAddress[]
  subject?: string
  body?: string
  replyToId?: string
  forwardedFromId?: string
}

interface AppState {
  sidebarCollapsed: boolean
  composeState: ComposeState
  composeData: ComposeData | null
  settingsOpen: boolean
  theme: Theme
  density: Density
  currentView: AppView
}

type AppAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_COMPOSE_STATE'; payload: ComposeState }
  | { type: 'SET_COMPOSE_DATA'; payload: ComposeData | null }
  | { type: 'OPEN_COMPOSE'; payload: { state: ComposeState; data: ComposeData | null } }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_DENSITY'; payload: Density }
  | { type: 'SET_VIEW'; payload: AppView }

interface AppContextValue extends AppState {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openCompose: (data?: ComposeData) => void
  openReply: (email: Email) => void
  openReplyAll: (email: Email) => void
  openForward: (email: Email) => void
  openDraft: (draft: Email) => void
  minimizeCompose: () => void
  maximizeCompose: () => void
  closeCompose: () => void
  openSettings: () => void
  closeSettings: () => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDensity: (density: Density) => void
  setView: (view: AppView) => void
  showMail: () => void
  showContacts: () => void
}

// --------------------------------------------------------------------------
// Validators
// --------------------------------------------------------------------------

const VALID_THEMES: Theme[] = ['light', 'dark']
const VALID_DENSITIES: Density[] = ['compact', 'default', 'comfortable']

function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && VALID_THEMES.includes(value as Theme)
}

function isValidDensity(value: unknown): value is Density {
  return typeof value === 'string' && VALID_DENSITIES.includes(value as Density)
}

// --------------------------------------------------------------------------
// Initial State
// --------------------------------------------------------------------------

function getInitialState(): AppState {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
  const savedDensity = localStorage.getItem(STORAGE_KEYS.DENSITY)

  return {
    sidebarCollapsed: false,
    composeState: 'closed',
    composeData: null,
    settingsOpen: false,
    theme: isValidTheme(savedTheme) ? savedTheme : 'light',
    density: isValidDensity(savedDensity) ? savedDensity : 'default',
    currentView: 'mail',
  }
}

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload }
    case 'SET_COMPOSE_STATE':
      return { ...state, composeState: action.payload }
    case 'SET_COMPOSE_DATA':
      return { ...state, composeData: action.payload }
    case 'OPEN_COMPOSE':
      return { ...state, composeState: action.payload.state, composeData: action.payload.data }
    case 'SET_SETTINGS_OPEN':
      return { ...state, settingsOpen: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_DENSITY':
      return { ...state, density: action.payload }
    case 'SET_VIEW':
      return { ...state, currentView: action.payload }
    default:
      return state
  }
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState)

  // Sync theme to document
  useEffect(() => {
    document.documentElement.setAttribute(DATA_ATTRIBUTES.THEME, state.theme)
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme)
  }, [state.theme])

  // Sync density to document
  useEffect(() => {
    document.documentElement.setAttribute(DATA_ATTRIBUTES.DENSITY, state.density)
    localStorage.setItem(STORAGE_KEYS.DENSITY, state.density)
  }, [state.density])

  // Helper to create reply body with quoted text
  const createQuotedBody = useCallback((email: Email, prefix: string) => {
    const date = new Date(email.date).toLocaleString()
    return `<br><br>${prefix}<br><br><blockquote style="margin-left: 0.5em; padding-left: 1em; border-left: 2px solid #ccc; color: #666;">On ${date}, ${email.from.name} &lt;${email.from.email}&gt; wrote:<br><br>${email.body}</blockquote>`
  }, [])

  // Memoized action creators
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), [])
  const setSidebarCollapsed = useCallback(
    (collapsed: boolean) => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed }),
    []
  )
  const openCompose = useCallback((data?: ComposeData) => {
    dispatch({
      type: 'OPEN_COMPOSE',
      payload: { state: 'open', data: data ?? { mode: 'new' } }
    })
  }, [])

  const openReply = useCallback((email: Email) => {
    const replySubject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`
    dispatch({
      type: 'OPEN_COMPOSE',
      payload: {
        state: 'open',
        data: {
          mode: 'reply',
          originalEmail: email,
          to: [email.from],
          subject: replySubject,
          body: createQuotedBody(email, ''),
          replyToId: email.id,
        }
      }
    })
  }, [createQuotedBody])

  const openReplyAll = useCallback((email: Email) => {
    const replySubject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`
    // Reply all includes original sender + all other recipients (excluding yourself)
    const allRecipients = [email.from, ...email.to.filter(r => r.email !== email.from.email)]
    const ccRecipients = email.cc?.filter(r => r.email !== email.from.email) ?? []
    dispatch({
      type: 'OPEN_COMPOSE',
      payload: {
        state: 'open',
        data: {
          mode: 'replyAll',
          originalEmail: email,
          to: allRecipients,
          cc: ccRecipients.length > 0 ? ccRecipients : undefined,
          subject: replySubject,
          body: createQuotedBody(email, ''),
          replyToId: email.id,
        }
      }
    })
  }, [createQuotedBody])

  const openForward = useCallback((email: Email) => {
    const forwardSubject = email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`
    dispatch({
      type: 'OPEN_COMPOSE',
      payload: {
        state: 'open',
        data: {
          mode: 'forward',
          originalEmail: email,
          to: [],
          subject: forwardSubject,
          body: createQuotedBody(email, '---------- Forwarded message ---------'),
          forwardedFromId: email.id,
        }
      }
    })
  }, [createQuotedBody])

  const openDraft = useCallback((draft: Email) => {
    dispatch({
      type: 'OPEN_COMPOSE',
      payload: {
        state: 'open',
        data: {
          mode: 'editDraft',
          originalEmail: draft,
          draftId: draft.id,
          to: draft.to,
          cc: draft.cc,
          subject: draft.subject,
          body: draft.body,
          replyToId: draft.replyToId,
          forwardedFromId: draft.forwardedFromId,
        }
      }
    })
  }, [])

  const minimizeCompose = useCallback(() => dispatch({ type: 'SET_COMPOSE_STATE', payload: 'minimized' }), [])
  const maximizeCompose = useCallback(() => dispatch({ type: 'SET_COMPOSE_STATE', payload: 'maximized' }), [])
  const closeCompose = useCallback(() => {
    dispatch({ type: 'SET_COMPOSE_STATE', payload: 'closed' })
    dispatch({ type: 'SET_COMPOSE_DATA', payload: null })
  }, [])
  const openSettings = useCallback(() => dispatch({ type: 'SET_SETTINGS_OPEN', payload: true }), [])
  const closeSettings = useCallback(() => dispatch({ type: 'SET_SETTINGS_OPEN', payload: false }), [])
  const setTheme = useCallback(
    (theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    []
  )
  const toggleTheme = useCallback(
    () => dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' }),
    [state.theme]
  )
  const setDensity = useCallback(
    (density: Density) => dispatch({ type: 'SET_DENSITY', payload: density }),
    []
  )
  const setView = useCallback(
    (view: AppView) => dispatch({ type: 'SET_VIEW', payload: view }),
    []
  )
  const showMail = useCallback(() => dispatch({ type: 'SET_VIEW', payload: 'mail' }), [])
  const showContacts = useCallback(() => dispatch({ type: 'SET_VIEW', payload: 'contacts' }), [])

  // Memoized context value
  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      toggleSidebar,
      setSidebarCollapsed,
      openCompose,
      openReply,
      openReplyAll,
      openForward,
      openDraft,
      minimizeCompose,
      maximizeCompose,
      closeCompose,
      openSettings,
      closeSettings,
      setTheme,
      toggleTheme,
      setDensity,
      setView,
      showMail,
      showContacts,
    }),
    [
      state,
      toggleSidebar,
      setSidebarCollapsed,
      openCompose,
      openReply,
      openReplyAll,
      openForward,
      openDraft,
      minimizeCompose,
      maximizeCompose,
      closeCompose,
      openSettings,
      closeSettings,
      setTheme,
      toggleTheme,
      setDensity,
      setView,
      showMail,
      showContacts,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
