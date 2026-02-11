/**
 * Features Context
 * Provides additional email features: scheduled send, snooze, saved searches, and templates
 */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import type { SavedSearch, EmailTemplate, EmailSearchQuery } from '@/types/email'
import { storage, STORAGE_KEYS, generateId } from '@/services/storage'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface FeaturesState {
  savedSearches: SavedSearch[]
  templates: EmailTemplate[]
  isLoading: boolean
}

type FeaturesAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_SAVED_SEARCHES'; searches: SavedSearch[] }
  | { type: 'ADD_SAVED_SEARCH'; search: SavedSearch }
  | { type: 'UPDATE_SAVED_SEARCH'; id: string; updates: Partial<SavedSearch> }
  | { type: 'DELETE_SAVED_SEARCH'; id: string }
  | { type: 'SET_TEMPLATES'; templates: EmailTemplate[] }
  | { type: 'ADD_TEMPLATE'; template: EmailTemplate }
  | { type: 'UPDATE_TEMPLATE'; id: string; updates: Partial<EmailTemplate> }
  | { type: 'DELETE_TEMPLATE'; id: string }

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

const initialState: FeaturesState = {
  savedSearches: [],
  templates: [],
  isLoading: true,
}

function featuresReducer(state: FeaturesState, action: FeaturesAction): FeaturesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'SET_SAVED_SEARCHES':
      return { ...state, savedSearches: action.searches }

    case 'ADD_SAVED_SEARCH':
      return { ...state, savedSearches: [...state.savedSearches, action.search] }

    case 'UPDATE_SAVED_SEARCH':
      return {
        ...state,
        savedSearches: state.savedSearches.map((s) =>
          s.id === action.id ? { ...s, ...action.updates, updatedAt: new Date() } : s
        ),
      }

    case 'DELETE_SAVED_SEARCH':
      return {
        ...state,
        savedSearches: state.savedSearches.filter((s) => s.id !== action.id),
      }

    case 'SET_TEMPLATES':
      return { ...state, templates: action.templates }

    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.template] }

    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.id ? { ...t, ...action.updates, updatedAt: new Date() } : t
        ),
      }

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.id),
      }

    default:
      return state
  }
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

interface FeaturesContextValue {
  // Saved Searches
  savedSearches: SavedSearch[]
  addSavedSearch: (name: string, query: EmailSearchQuery) => void
  updateSavedSearch: (id: string, updates: Partial<SavedSearch>) => void
  deleteSavedSearch: (id: string) => void

  // Email Templates
  templates: EmailTemplate[]
  addTemplate: (name: string, subject: string, body: string) => void
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => void
  deleteTemplate: (id: string) => void

  isLoading: boolean
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null)

// --------------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------------

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(featuresReducer, initialState)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Load data from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [savedSearches, templates] = await Promise.all([
          storage.get<SavedSearch[]>(STORAGE_KEYS.SAVED_SEARCHES),
          storage.get<EmailTemplate[]>(STORAGE_KEYS.EMAIL_TEMPLATES),
        ])

        if (isMountedRef.current) {
          dispatch({ type: 'SET_SAVED_SEARCHES', searches: savedSearches ?? [] })
          dispatch({ type: 'SET_TEMPLATES', templates: templates ?? [] })
          dispatch({ type: 'SET_LOADING', loading: false })
        }
      } catch {
        if (isMountedRef.current) {
          dispatch({ type: 'SET_LOADING', loading: false })
        }
      }
    }
    loadData()
  }, [])

  // Persist saved searches
  useEffect(() => {
    if (!state.isLoading) {
      storage.set(STORAGE_KEYS.SAVED_SEARCHES, state.savedSearches)
    }
  }, [state.savedSearches, state.isLoading])

  // Persist templates
  useEffect(() => {
    if (!state.isLoading) {
      storage.set(STORAGE_KEYS.EMAIL_TEMPLATES, state.templates)
    }
  }, [state.templates, state.isLoading])

  // Saved search actions
  const addSavedSearch = useCallback((name: string, query: EmailSearchQuery) => {
    const now = new Date()
    const search: SavedSearch = {
      id: generateId(),
      name,
      query,
      createdAt: now,
      updatedAt: now,
    }
    dispatch({ type: 'ADD_SAVED_SEARCH', search })
  }, [])

  const updateSavedSearch = useCallback((id: string, updates: Partial<SavedSearch>) => {
    dispatch({ type: 'UPDATE_SAVED_SEARCH', id, updates })
  }, [])

  const deleteSavedSearch = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SAVED_SEARCH', id })
  }, [])

  // Template actions
  const addTemplate = useCallback((name: string, subject: string, body: string) => {
    const now = new Date()
    const template: EmailTemplate = {
      id: generateId(),
      name,
      subject,
      body,
      createdAt: now,
      updatedAt: now,
    }
    dispatch({ type: 'ADD_TEMPLATE', template })
  }, [])

  const updateTemplate = useCallback((id: string, updates: Partial<EmailTemplate>) => {
    dispatch({ type: 'UPDATE_TEMPLATE', id, updates })
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', id })
  }, [])

  const value = useMemo<FeaturesContextValue>(
    () => ({
      savedSearches: state.savedSearches,
      addSavedSearch,
      updateSavedSearch,
      deleteSavedSearch,
      templates: state.templates,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      isLoading: state.isLoading,
    }),
    [
      state.savedSearches,
      state.templates,
      state.isLoading,
      addSavedSearch,
      updateSavedSearch,
      deleteSavedSearch,
      addTemplate,
      updateTemplate,
      deleteTemplate,
    ]
  )

  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useFeatures(): FeaturesContextValue {
  const context = useContext(FeaturesContext)
  if (!context) {
    throw new Error('useFeatures must be used within a FeaturesProvider')
  }
  return context
}
