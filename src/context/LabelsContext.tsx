/**
 * Labels Context
 * Manages email labels with persistence via repository pattern
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
import type { Label } from '@/types/email'
import { useRepositories } from './RepositoryContext'

interface LabelsState {
  labels: Label[]
  isLoading: boolean
  error: string | null
  selectedLabelId: string | null
}

type LabelsAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_LABELS'; labels: Label[] }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'ADD_LABEL'; label: Label }
  | { type: 'UPDATE_LABEL'; id: string; updates: Partial<Label> }
  | { type: 'DELETE_LABEL'; id: string }
  | { type: 'SELECT_LABEL'; id: string | null }

const initialState: LabelsState = {
  labels: [],
  isLoading: true,
  error: null,
  selectedLabelId: null,
}

function labelsReducer(state: LabelsState, action: LabelsAction): LabelsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'SET_LABELS':
      return { ...state, labels: action.labels, isLoading: false }

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }

    case 'ADD_LABEL':
      return { ...state, labels: [...state.labels, action.label] }

    case 'UPDATE_LABEL':
      return {
        ...state,
        labels: state.labels.map((l) =>
          l.id === action.id ? { ...l, ...action.updates } : l
        ),
      }

    case 'DELETE_LABEL':
      return {
        ...state,
        labels: state.labels.filter((l) => l.id !== action.id),
        selectedLabelId: state.selectedLabelId === action.id ? null : state.selectedLabelId,
      }

    case 'SELECT_LABEL':
      return { ...state, selectedLabelId: action.id }

    default:
      return state
  }
}

interface LabelsContextValue {
  labels: Label[]
  isLoading: boolean
  error: string | null
  selectedLabelId: string | null

  // CRUD
  addLabel: (name: string, color: string) => Promise<void>
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
  getLabelById: (id: string) => Label | undefined

  // Selection
  selectLabel: (id: string | null) => void
}

const LabelsContext = createContext<LabelsContextValue | null>(null)

export function LabelsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(labelsReducer, initialState)
  const { labels: labelRepository } = useRepositories()

  // Load labels from repository on mount
  useEffect(() => {
    async function loadLabels() {
      try {
        const labels = await labelRepository.getAll()
        dispatch({ type: 'SET_LABELS', labels })
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load labels' })
      }
    }
    loadLabels()
  }, [labelRepository])

  // CRUD operations
  const addLabel = useCallback(
    async (name: string, color: string) => {
      const result = await labelRepository.create(name, color)
      if (result.success) {
        dispatch({ type: 'ADD_LABEL', label: result.data })
      }
    },
    [labelRepository]
  )

  const updateLabel = useCallback(
    async (id: string, updates: Partial<Label>) => {
      dispatch({ type: 'UPDATE_LABEL', id, updates })
      await labelRepository.update(id, updates)
    },
    [labelRepository]
  )

  const deleteLabel = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE_LABEL', id })
      await labelRepository.delete(id)
    },
    [labelRepository]
  )

  const getLabelById = useCallback(
    (id: string) => state.labels.find((l) => l.id === id),
    [state.labels]
  )

  const selectLabel = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_LABEL', id })
  }, [])

  const value = useMemo<LabelsContextValue>(
    () => ({
      labels: state.labels,
      isLoading: state.isLoading,
      error: state.error,
      selectedLabelId: state.selectedLabelId,
      addLabel,
      updateLabel,
      deleteLabel,
      getLabelById,
      selectLabel,
    }),
    [state, addLabel, updateLabel, deleteLabel, getLabelById, selectLabel]
  )

  return <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLabels(): LabelsContextValue {
  const context = useContext(LabelsContext)
  if (!context) {
    throw new Error('useLabels must be used within a LabelsProvider')
  }
  return context
}
