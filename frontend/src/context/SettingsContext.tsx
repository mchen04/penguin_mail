/**
 * Settings Context
 * Provides app settings with persistence via repository pattern
 */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type {
  Settings,
  Theme,
  Density,
  FontSize,
  ReadingPanePosition,
  ReplyBehavior,
  SendBehavior,
  Signature,
  NotificationSettings,
  VacationResponder,
  KeyboardShortcut,
  FilterRule,
} from '@/types/settings'
import { createDefaultSettings } from '@/types/settings'
import { useRepositories } from './RepositoryContext'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface SettingsState {
  settings: Settings
  isLoading: boolean
  error: string | null
}

type SettingsAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_SETTINGS'; settings: Settings }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'UPDATE_SETTINGS'; updates: Partial<Settings> }
  | { type: 'UPDATE_APPEARANCE'; updates: Partial<Settings['appearance']> }
  | { type: 'UPDATE_NOTIFICATIONS'; updates: Partial<Settings['notifications']> }
  | { type: 'UPDATE_INBOX_BEHAVIOR'; updates: Partial<Settings['inboxBehavior']> }
  | { type: 'UPDATE_LANGUAGE'; updates: Partial<Settings['language']> }
  | { type: 'ADD_SIGNATURE'; signature: Signature }
  | { type: 'UPDATE_SIGNATURE'; id: string; updates: Partial<Signature> }
  | { type: 'DELETE_SIGNATURE'; id: string }
  | { type: 'SET_DEFAULT_SIGNATURE'; id: string }
  | { type: 'UPDATE_VACATION_RESPONDER'; updates: Partial<VacationResponder> }
  | { type: 'UPDATE_KEYBOARD_SHORTCUT'; id: string; updates: Partial<KeyboardShortcut> }
  | { type: 'ADD_FILTER'; filter: FilterRule }
  | { type: 'UPDATE_FILTER'; id: string; updates: Partial<FilterRule> }
  | { type: 'DELETE_FILTER'; id: string }
  | { type: 'BLOCK_ADDRESS'; email: string }
  | { type: 'UNBLOCK_ADDRESS'; email: string }

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

const initialState: SettingsState = {
  settings: createDefaultSettings(),
  isLoading: true,
  error: null,
}

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'SET_SETTINGS':
      return { ...state, settings: action.settings, isLoading: false, error: null }

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.updates } }

    case 'UPDATE_APPEARANCE':
      return {
        ...state,
        settings: {
          ...state.settings,
          appearance: { ...state.settings.appearance, ...action.updates },
        },
      }

    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        settings: {
          ...state.settings,
          notifications: { ...state.settings.notifications, ...action.updates },
        },
      }

    case 'UPDATE_INBOX_BEHAVIOR':
      return {
        ...state,
        settings: {
          ...state.settings,
          inboxBehavior: { ...state.settings.inboxBehavior, ...action.updates },
        },
      }

    case 'UPDATE_LANGUAGE':
      return {
        ...state,
        settings: {
          ...state.settings,
          language: { ...state.settings.language, ...action.updates },
        },
      }

    case 'ADD_SIGNATURE':
      return {
        ...state,
        settings: {
          ...state.settings,
          signatures: [...state.settings.signatures, action.signature],
        },
      }

    case 'UPDATE_SIGNATURE':
      return {
        ...state,
        settings: {
          ...state.settings,
          signatures: state.settings.signatures.map((sig) =>
            sig.id === action.id ? { ...sig, ...action.updates } : sig
          ),
        },
      }

    case 'DELETE_SIGNATURE':
      return {
        ...state,
        settings: {
          ...state.settings,
          signatures: state.settings.signatures.filter((sig) => sig.id !== action.id),
        },
      }

    case 'SET_DEFAULT_SIGNATURE':
      return {
        ...state,
        settings: {
          ...state.settings,
          signatures: state.settings.signatures.map((sig) => ({
            ...sig,
            isDefault: sig.id === action.id,
          })),
        },
      }

    case 'UPDATE_VACATION_RESPONDER':
      return {
        ...state,
        settings: {
          ...state.settings,
          vacationResponder: { ...state.settings.vacationResponder, ...action.updates },
        },
      }

    case 'UPDATE_KEYBOARD_SHORTCUT':
      return {
        ...state,
        settings: {
          ...state.settings,
          keyboardShortcuts: state.settings.keyboardShortcuts.map((shortcut) =>
            shortcut.id === action.id ? { ...shortcut, ...action.updates } : shortcut
          ),
        },
      }

    case 'ADD_FILTER':
      return {
        ...state,
        settings: {
          ...state.settings,
          filters: [...state.settings.filters, action.filter],
        },
      }

    case 'UPDATE_FILTER':
      return {
        ...state,
        settings: {
          ...state.settings,
          filters: state.settings.filters.map((filter) =>
            filter.id === action.id ? { ...filter, ...action.updates } : filter
          ),
        },
      }

    case 'DELETE_FILTER':
      return {
        ...state,
        settings: {
          ...state.settings,
          filters: state.settings.filters.filter((filter) => filter.id !== action.id),
        },
      }

    case 'BLOCK_ADDRESS': {
      const newBlockedAddress = {
        id: `blocked-${Date.now()}`,
        email: action.email,
        createdAt: new Date(),
      }
      return {
        ...state,
        settings: {
          ...state.settings,
          blockedAddresses: [...state.settings.blockedAddresses, newBlockedAddress],
        },
      }
    }

    case 'UNBLOCK_ADDRESS':
      return {
        ...state,
        settings: {
          ...state.settings,
          blockedAddresses: state.settings.blockedAddresses.filter(
            (addr) => addr.email !== action.email
          ),
        },
      }

    default:
      return state
  }
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

interface SettingsContextValue {
  settings: Settings
  isLoading: boolean
  error: string | null

  // Appearance
  theme: Theme
  density: Density
  fontSize: FontSize
  readingPanePosition: ReadingPanePosition
  setTheme: (theme: Theme) => void
  setDensity: (density: Density) => void
  setFontSize: (fontSize: FontSize) => void
  setReadingPanePosition: (position: ReadingPanePosition) => void

  // Notifications
  notifications: NotificationSettings
  updateNotifications: (updates: Partial<NotificationSettings>) => void

  // Inbox behavior
  replyBehavior: ReplyBehavior
  sendBehavior: SendBehavior
  conversationView: boolean
  setReplyBehavior: (behavior: ReplyBehavior) => void
  setSendBehavior: (behavior: SendBehavior) => void
  setConversationView: (enabled: boolean) => void
  updateInboxBehavior: (updates: Partial<Settings['inboxBehavior']>) => void

  // Language
  updateLanguage: (updates: Partial<Settings['language']>) => void

  // Signatures
  signatures: Signature[]
  addSignature: (name: string, content: string, isDefault?: boolean) => void
  updateSignature: (id: string, updates: Partial<Signature>) => void
  deleteSignature: (id: string) => void
  setDefaultSignature: (id: string) => void

  // Vacation responder
  vacationResponder: VacationResponder
  updateVacationResponder: (updates: Partial<VacationResponder>) => void

  // Keyboard shortcuts
  keyboardShortcuts: KeyboardShortcut[]
  updateKeyboardShortcut: (id: string, updates: Partial<KeyboardShortcut>) => void
  getShortcut: (id: string) => KeyboardShortcut | undefined

  // Filters
  filters: FilterRule[]
  addFilter: (filter: Omit<FilterRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateFilter: (id: string, updates: Partial<FilterRule>) => void
  deleteFilter: (id: string) => void

  // Blocked addresses
  blockedAddresses: string[]
  blockAddress: (email: string) => void
  unblockAddress: (email: string) => void
  isBlocked: (email: string) => boolean

  // Reset
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

// --------------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------------

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState)
  const { settings: settingsRepository } = useRepositories()

  // Load settings from repository on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await settingsRepository.get()
        dispatch({ type: 'SET_SETTINGS', settings })
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load settings' })
      }
    }
    loadSettings()
  }, [settingsRepository])

  // Persist settings whenever they change via repository
  useEffect(() => {
    if (!state.isLoading) {
      settingsRepository.update(state.settings)
    }
  }, [state.settings, state.isLoading, settingsRepository])

  // Extract appearance settings for effect dependencies
  const { theme, density, fontSize } = state.settings.appearance

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  // Apply density to document
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

  // Apply font size to document
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize])

  // Appearance actions
  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'UPDATE_APPEARANCE', updates: { theme } })
  }, [])

  const setDensity = useCallback((density: Density) => {
    dispatch({ type: 'UPDATE_APPEARANCE', updates: { density } })
  }, [])

  const setFontSize = useCallback((fontSize: FontSize) => {
    dispatch({ type: 'UPDATE_APPEARANCE', updates: { fontSize } })
  }, [])

  const setReadingPanePosition = useCallback((readingPanePosition: ReadingPanePosition) => {
    dispatch({ type: 'UPDATE_INBOX_BEHAVIOR', updates: { readingPanePosition } })
  }, [])

  // Notifications
  const updateNotifications = useCallback((updates: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_NOTIFICATIONS', updates })
  }, [])

  // Inbox behavior
  const setReplyBehavior = useCallback((defaultReplyBehavior: ReplyBehavior) => {
    dispatch({ type: 'UPDATE_INBOX_BEHAVIOR', updates: { defaultReplyBehavior } })
  }, [])

  const setSendBehavior = useCallback((sendBehavior: SendBehavior) => {
    dispatch({ type: 'UPDATE_INBOX_BEHAVIOR', updates: { sendBehavior } })
  }, [])

  const setConversationView = useCallback((conversationView: boolean) => {
    dispatch({ type: 'UPDATE_INBOX_BEHAVIOR', updates: { conversationView } })
  }, [])

  const updateInboxBehavior = useCallback((updates: Partial<Settings['inboxBehavior']>) => {
    dispatch({ type: 'UPDATE_INBOX_BEHAVIOR', updates })
  }, [])

  // Language
  const updateLanguage = useCallback((updates: Partial<Settings['language']>) => {
    dispatch({ type: 'UPDATE_LANGUAGE', updates })
  }, [])

  // Signatures
  const addSignature = useCallback((name: string, content: string, isDefault = false) => {
    const signature: Signature = {
      id: `sig-${Date.now()}`,
      name,
      content,
      isDefault,
    }
    dispatch({ type: 'ADD_SIGNATURE', signature })
  }, [])

  const updateSignature = useCallback((id: string, updates: Partial<Signature>) => {
    dispatch({ type: 'UPDATE_SIGNATURE', id, updates })
  }, [])

  const deleteSignature = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SIGNATURE', id })
  }, [])

  const setDefaultSignature = useCallback((id: string) => {
    dispatch({ type: 'SET_DEFAULT_SIGNATURE', id })
  }, [])

  // Vacation responder
  const updateVacationResponder = useCallback((updates: Partial<VacationResponder>) => {
    dispatch({ type: 'UPDATE_VACATION_RESPONDER', updates })
  }, [])

  // Keyboard shortcuts
  const updateKeyboardShortcut = useCallback((id: string, updates: Partial<KeyboardShortcut>) => {
    dispatch({ type: 'UPDATE_KEYBOARD_SHORTCUT', id, updates })
  }, [])

  const getShortcut = useCallback(
    (id: string) => state.settings.keyboardShortcuts.find((s) => s.id === id),
    [state.settings.keyboardShortcuts]
  )

  // Filters
  const addFilter = useCallback(
    (filter: Omit<FilterRule, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date()
      const newFilter: FilterRule = {
        ...filter,
        id: `filter-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      }
      dispatch({ type: 'ADD_FILTER', filter: newFilter })
    },
    []
  )

  const updateFilter = useCallback((id: string, updates: Partial<FilterRule>) => {
    dispatch({ type: 'UPDATE_FILTER', id, updates: { ...updates, updatedAt: new Date() } })
  }, [])

  const deleteFilter = useCallback((id: string) => {
    dispatch({ type: 'DELETE_FILTER', id })
  }, [])

  // Blocked addresses
  const blockAddress = useCallback((email: string) => {
    dispatch({ type: 'BLOCK_ADDRESS', email })
  }, [])

  const unblockAddress = useCallback((email: string) => {
    dispatch({ type: 'UNBLOCK_ADDRESS', email })
  }, [])

  const isBlocked = useCallback(
    (email: string) => state.settings.blockedAddresses.some((addr) => addr.email === email),
    [state.settings.blockedAddresses]
  )

  // Reset
  const resetSettings = useCallback(async () => {
    const result = await settingsRepository.reset()
    if (result.success) {
      dispatch({ type: 'SET_SETTINGS', settings: result.data })
    }
  }, [settingsRepository])

  // Memoized context value
  const value = useMemo<SettingsContextValue>(
    () => ({
      settings: state.settings,
      isLoading: state.isLoading,
      error: state.error,

      theme: state.settings.appearance.theme,
      density: state.settings.appearance.density,
      fontSize: state.settings.appearance.fontSize,
      readingPanePosition: state.settings.inboxBehavior.readingPanePosition,
      setTheme,
      setDensity,
      setFontSize,
      setReadingPanePosition,

      notifications: state.settings.notifications,
      updateNotifications,

      replyBehavior: state.settings.inboxBehavior.defaultReplyBehavior,
      sendBehavior: state.settings.inboxBehavior.sendBehavior,
      conversationView: state.settings.inboxBehavior.conversationView,
      setReplyBehavior,
      setSendBehavior,
      setConversationView,
      updateInboxBehavior,

      updateLanguage,

      signatures: state.settings.signatures,
      addSignature,
      updateSignature,
      deleteSignature,
      setDefaultSignature,

      vacationResponder: state.settings.vacationResponder,
      updateVacationResponder,

      keyboardShortcuts: state.settings.keyboardShortcuts,
      updateKeyboardShortcut,
      getShortcut,

      filters: state.settings.filters,
      addFilter,
      updateFilter,
      deleteFilter,

      blockedAddresses: state.settings.blockedAddresses.map((addr) => addr.email),
      blockAddress,
      unblockAddress,
      isBlocked,

      resetSettings,
    }),
    [
      state,
      setTheme,
      setDensity,
      setFontSize,
      setReadingPanePosition,
      updateNotifications,
      setReplyBehavior,
      setSendBehavior,
      setConversationView,
      updateInboxBehavior,
      updateLanguage,
      addSignature,
      updateSignature,
      deleteSignature,
      setDefaultSignature,
      updateVacationResponder,
      updateKeyboardShortcut,
      getShortcut,
      addFilter,
      updateFilter,
      deleteFilter,
      blockAddress,
      unblockAddress,
      isBlocked,
      resetSettings,
    ]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
