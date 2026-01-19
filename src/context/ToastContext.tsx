/**
 * Toast Context
 * Provides toast notifications throughout the app
 */

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from 'react'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  // Convenience methods
  success: (message: string, action?: Toast['action']) => string
  error: (message: string, action?: Toast['action']) => string
  info: (message: string, action?: Toast['action']) => string
  warning: (message: string, action?: Toast['action']) => string
}

// --------------------------------------------------------------------------
// Context
// --------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 5000

// --------------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------------

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const duration = toast.duration ?? DEFAULT_DURATION

      setToasts((prev) => [...prev, { ...toast, id }])

      // Auto-remove after duration (unless it has an action)
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    [removeToast]
  )

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback(
    (message: string, action?: Toast['action']) =>
      addToast({ type: 'success', message, action }),
    [addToast]
  )

  const error = useCallback(
    (message: string, action?: Toast['action']) =>
      addToast({ type: 'error', message, action, duration: 8000 }),
    [addToast]
  )

  const info = useCallback(
    (message: string, action?: Toast['action']) =>
      addToast({ type: 'info', message, action }),
    [addToast]
  )

  const warning = useCallback(
    (message: string, action?: Toast['action']) =>
      addToast({ type: 'warning', message, action }),
    [addToast]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      addToast,
      removeToast,
      clearToasts,
      success,
      error,
      info,
      warning,
    }),
    [toasts, addToast, removeToast, clearToasts, success, error, info, warning]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
