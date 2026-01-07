import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Theme, Density } from '@/types/settings'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type CurrentView = 'list' | 'email'
type ComposeState = 'closed' | 'minimized' | 'open' | 'maximized'

interface AppState {
  sidebarCollapsed: boolean
  currentView: CurrentView
  selectedEmailId: string | null
  composeState: ComposeState
  settingsOpen: boolean
  theme: Theme
  density: Density
}

type AppAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_VIEW'; payload: CurrentView }
  | { type: 'SELECT_EMAIL'; payload: string | null }
  | { type: 'SET_COMPOSE_STATE'; payload: ComposeState }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_DENSITY'; payload: Density }

interface AppContextValue extends AppState {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setView: (view: CurrentView) => void
  selectEmail: (id: string | null) => void
  openCompose: () => void
  minimizeCompose: () => void
  maximizeCompose: () => void
  closeCompose: () => void
  openSettings: () => void
  closeSettings: () => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDensity: (density: Density) => void
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
  const savedTheme = localStorage.getItem('theme')
  const savedDensity = localStorage.getItem('density')

  return {
    sidebarCollapsed: false,
    currentView: 'list',
    selectedEmailId: null,
    composeState: 'closed',
    settingsOpen: false,
    theme: isValidTheme(savedTheme) ? savedTheme : 'light',
    density: isValidDensity(savedDensity) ? savedDensity : 'default',
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
    case 'SET_VIEW':
      return { ...state, currentView: action.payload }
    case 'SELECT_EMAIL':
      return {
        ...state,
        selectedEmailId: action.payload,
        currentView: action.payload ? 'email' : 'list',
      }
    case 'SET_COMPOSE_STATE':
      return { ...state, composeState: action.payload }
    case 'SET_SETTINGS_OPEN':
      return { ...state, settingsOpen: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_DENSITY':
      return { ...state, density: action.payload }
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
    document.documentElement.setAttribute('data-theme', state.theme)
    localStorage.setItem('theme', state.theme)
  }, [state.theme])

  // Sync density to document
  useEffect(() => {
    document.documentElement.setAttribute('data-density', state.density)
    localStorage.setItem('density', state.density)
  }, [state.density])

  // Memoized action creators
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), [])
  const setSidebarCollapsed = useCallback(
    (collapsed: boolean) => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed }),
    []
  )
  const setView = useCallback(
    (view: CurrentView) => dispatch({ type: 'SET_VIEW', payload: view }),
    []
  )
  const selectEmail = useCallback(
    (id: string | null) => dispatch({ type: 'SELECT_EMAIL', payload: id }),
    []
  )
  const openCompose = useCallback(() => dispatch({ type: 'SET_COMPOSE_STATE', payload: 'open' }), [])
  const minimizeCompose = useCallback(() => dispatch({ type: 'SET_COMPOSE_STATE', payload: 'minimized' }), [])
  const maximizeCompose = useCallback(() => dispatch({ type: 'SET_COMPOSE_STATE', payload: 'maximized' }), [])
  const closeCompose = useCallback(() => dispatch({ type: 'SET_COMPOSE_STATE', payload: 'closed' }), [])
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

  // Memoized context value
  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      toggleSidebar,
      setSidebarCollapsed,
      setView,
      selectEmail,
      openCompose,
      minimizeCompose,
      maximizeCompose,
      closeCompose,
      openSettings,
      closeSettings,
      setTheme,
      toggleTheme,
      setDensity,
    }),
    [
      state,
      toggleSidebar,
      setSidebarCollapsed,
      setView,
      selectEmail,
      openCompose,
      minimizeCompose,
      maximizeCompose,
      closeCompose,
      openSettings,
      closeSettings,
      setTheme,
      toggleTheme,
      setDensity,
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
