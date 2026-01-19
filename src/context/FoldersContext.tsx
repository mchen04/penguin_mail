/**
 * Folders Context
 * Manages custom email folders with persistence via repository pattern
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
import type { CustomFolder } from '@/types/email'
import { useRepositories } from './RepositoryContext'

interface FoldersState {
  folders: CustomFolder[]
  isLoading: boolean
  error: string | null
}

type FoldersAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_FOLDERS'; folders: CustomFolder[] }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'ADD_FOLDER'; folder: CustomFolder }
  | { type: 'UPDATE_FOLDER'; id: string; updates: Partial<CustomFolder> }
  | { type: 'DELETE_FOLDER'; id: string }

const initialState: FoldersState = {
  folders: [],
  isLoading: true,
  error: null,
}

function foldersReducer(state: FoldersState, action: FoldersAction): FoldersState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'SET_FOLDERS':
      return { ...state, folders: action.folders, isLoading: false }

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }

    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.folder].sort((a, b) => a.order - b.order) }

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

interface FoldersContextValue {
  folders: CustomFolder[]
  isLoading: boolean
  error: string | null

  // CRUD
  addFolder: (name: string, color: string, parentId?: string) => Promise<void>
  updateFolder: (id: string, updates: Partial<CustomFolder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  getFolderById: (id: string) => CustomFolder | undefined

  // Hierarchy helpers
  getRootFolders: () => CustomFolder[]
  getChildFolders: (parentId: string) => CustomFolder[]
}

const FoldersContext = createContext<FoldersContextValue | null>(null)

export function FoldersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(foldersReducer, initialState)
  const { folders: folderRepository } = useRepositories()

  // Load folders from repository on mount
  useEffect(() => {
    async function loadFolders() {
      try {
        const folders = await folderRepository.getAll()
        dispatch({ type: 'SET_FOLDERS', folders })
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Failed to load folders' })
      }
    }
    loadFolders()
  }, [folderRepository])

  // CRUD operations
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

  const value = useMemo<FoldersContextValue>(
    () => ({
      folders: state.folders,
      isLoading: state.isLoading,
      error: state.error,
      addFolder,
      updateFolder,
      deleteFolder,
      getFolderById,
      getRootFolders,
      getChildFolders,
    }),
    [state, addFolder, updateFolder, deleteFolder, getFolderById, getRootFolders, getChildFolders]
  )

  return <FoldersContext.Provider value={value}>{children}</FoldersContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFolders(): FoldersContextValue {
  const context = useContext(FoldersContext)
  if (!context) {
    throw new Error('useFolders must be used within a FoldersProvider')
  }
  return context
}
