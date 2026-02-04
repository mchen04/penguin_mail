/**
 * Organization Context
 * Manages email labels and custom folders with persistence via repository pattern
 * Consolidates LabelsContext and FoldersContext to reduce provider nesting
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
import type { Label, CustomFolder } from '@/types/email'
import { useRepositories } from './RepositoryContext'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface OrganizationState {
  labels: Label[]
  folders: CustomFolder[]
  isLoading: boolean
  error: string | null
  selectedLabelId: string | null
}

type OrganizationAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_LABELS'; labels: Label[] }
  | { type: 'SET_FOLDERS'; folders: CustomFolder[] }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'ADD_LABEL'; label: Label }
  | { type: 'UPDATE_LABEL'; id: string; updates: Partial<Label> }
  | { type: 'DELETE_LABEL'; id: string }
  | { type: 'SELECT_LABEL'; id: string | null }
  | { type: 'ADD_FOLDER'; folder: CustomFolder }
  | { type: 'UPDATE_FOLDER'; id: string; updates: Partial<CustomFolder> }
  | { type: 'DELETE_FOLDER'; id: string }

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

const initialState: OrganizationState = {
  labels: [],
  folders: [],
  isLoading: true,
  error: null,
  selectedLabelId: null,
}

function organizationReducer(state: OrganizationState, action: OrganizationAction): OrganizationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'SET_LABELS':
      return { ...state, labels: action.labels, isLoading: false }

    case 'SET_FOLDERS':
      return { ...state, folders: action.folders.sort((a, b) => a.order - b.order), isLoading: false }

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }

    // Label actions
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

    // Folder actions
    case 'ADD_FOLDER':
      return {
        ...state,
        folders: [...state.folders, action.folder].sort((a, b) => a.order - b.order),
      }

    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.id === action.id ? { ...f, ...action.updates } : f
        ).sort((a, b) => a.order - b.order),
      }

    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== action.id && f.parentId !== action.id),
      }

    default:
      return state
  }
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

interface OrganizationContextValue {
  // Labels
  labels: Label[]
  selectedLabelId: string | null
  addLabel: (name: string, color: string) => Promise<void>
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
  getLabelById: (id: string) => Label | undefined
  selectLabel: (id: string | null) => void

  // Folders
  folders: CustomFolder[]
  addFolder: (name: string, color: string, parentId?: string) => Promise<void>
  updateFolder: (id: string, updates: Partial<CustomFolder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  getFolderById: (id: string) => CustomFolder | undefined
  getRootFolders: () => CustomFolder[]
  getChildFolders: (parentId: string) => CustomFolder[]

  // Common
  isLoading: boolean
  error: string | null
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

// --------------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------------

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(organizationReducer, initialState)
  const { labels: labelRepository, folders: folderRepository } = useRepositories()

  // Load labels and folders from repositories on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [labels, folders] = await Promise.all([
          labelRepository.getAll(),
          folderRepository.getAll(),
        ])
        dispatch({ type: 'SET_LABELS', labels })
        dispatch({ type: 'SET_FOLDERS', folders })
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load labels and folders' })
      }
    }
    loadData()
  }, [labelRepository, folderRepository])

  // --------------------------------------------------------------------------
  // Label operations
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Folder operations
  // --------------------------------------------------------------------------

  const addFolder = useCallback(
    async (name: string, color: string, parentId?: string) => {
      const result = await folderRepository.create(name, color, parentId)
      if (result.success) {
        dispatch({ type: 'ADD_FOLDER', folder: result.data })
      }
    },
    [folderRepository]
  )

  const updateFolder = useCallback(
    async (id: string, updates: Partial<CustomFolder>) => {
      dispatch({ type: 'UPDATE_FOLDER', id, updates })
      await folderRepository.update(id, updates)
    },
    [folderRepository]
  )

  const deleteFolder = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE_FOLDER', id })
      await folderRepository.delete(id)
    },
    [folderRepository]
  )

  const getFolderById = useCallback(
    (id: string) => state.folders.find((f) => f.id === id),
    [state.folders]
  )

  const getRootFolders = useCallback(
    () => state.folders.filter((f) => !f.parentId),
    [state.folders]
  )

  const getChildFolders = useCallback(
    (parentId: string) => state.folders.filter((f) => f.parentId === parentId),
    [state.folders]
  )

  // --------------------------------------------------------------------------
  // Context value
  // --------------------------------------------------------------------------

  const value = useMemo<OrganizationContextValue>(
    () => ({
      // Labels
      labels: state.labels,
      selectedLabelId: state.selectedLabelId,
      addLabel,
      updateLabel,
      deleteLabel,
      getLabelById,
      selectLabel,

      // Folders
      folders: state.folders,
      addFolder,
      updateFolder,
      deleteFolder,
      getFolderById,
      getRootFolders,
      getChildFolders,

      // Common
      isLoading: state.isLoading,
      error: state.error,
    }),
    [
      state,
      addLabel,
      updateLabel,
      deleteLabel,
      getLabelById,
      selectLabel,
      addFolder,
      updateFolder,
      deleteFolder,
      getFolderById,
      getRootFolders,
      getChildFolders,
    ]
  )

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

// --------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

// Convenience hooks for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export function useLabels() {
  const {
    labels,
    selectedLabelId,
    addLabel,
    updateLabel,
    deleteLabel,
    getLabelById,
    selectLabel,
    isLoading,
    error,
  } = useOrganization()

  return {
    labels,
    selectedLabelId,
    addLabel,
    updateLabel,
    deleteLabel,
    getLabelById,
    selectLabel,
    isLoading,
    error,
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFolders() {
  const {
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    getFolderById,
    getRootFolders,
    getChildFolders,
    isLoading,
    error,
  } = useOrganization()

  return {
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    getFolderById,
    getRootFolders,
    getChildFolders,
    isLoading,
    error,
  }
}
