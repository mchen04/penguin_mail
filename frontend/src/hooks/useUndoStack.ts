/**
 * useUndoStack - A hook for managing undoable operations
 * Provides a stack of reversible actions with auto-expiry
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { UNDO_STACK, RANDOM_ID } from '@/constants'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface UndoableAction<T = unknown> {
  /** Unique identifier for this action */
  id: string
  /** Type of action for categorization */
  type: string
  /** Human-readable description */
  description: string
  /** Function to execute when undoing */
  undo: () => void | Promise<void>
  /** Optional data associated with the action */
  data?: T
  /** Timestamp when the action was created */
  createdAt: number
  /** When the undo expires (auto-removed from stack) */
  expiresAt: number
}

interface UseUndoStackOptions {
  /** Time in ms before undo expires (default: UNDO_STACK.DEFAULT_EXPIRE_TIME) */
  expireTime?: number
  /** Maximum stack size (default: 10) */
  maxSize?: number
  /** Callback when an action expires */
  onExpire?: (action: UndoableAction) => void
}

interface UseUndoStackReturn {
  /** Current undo stack (most recent first) */
  stack: UndoableAction[]
  /** Push a new undoable action */
  push: <T>(
    type: string,
    description: string,
    undoFn: () => void | Promise<void>,
    data?: T
  ) => UndoableAction<T>
  /** Execute undo for the most recent action */
  undoLast: () => Promise<boolean>
  /** Execute undo for a specific action by id */
  undoById: (id: string) => Promise<boolean>
  /** Clear a specific action from the stack without undoing */
  dismiss: (id: string) => void
  /** Clear all actions from the stack */
  clear: () => void
  /** Check if there are actions to undo */
  canUndo: boolean
  /** Get the most recent action */
  lastAction: UndoableAction | null
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

export function useUndoStack(options: UseUndoStackOptions = {}): UseUndoStackReturn {
  const {
    expireTime = UNDO_STACK.DEFAULT_EXPIRE_TIME,
    maxSize = UNDO_STACK.DEFAULT_MAX_SIZE,
    onExpire,
  } = options

  const [stack, setStack] = useState<UndoableAction[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const onExpireRef = useRef(onExpire)

  // Keep onExpire ref current
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const scheduleExpiry = useCallback((action: UndoableAction) => {
    const timeUntilExpiry = action.expiresAt - Date.now()
    if (timeUntilExpiry <= 0) return

    const timer = setTimeout(() => {
      setStack((prev) => {
        const filtered = prev.filter((a) => a.id !== action.id)
        if (filtered.length !== prev.length && onExpireRef.current) {
          onExpireRef.current(action)
        }
        return filtered
      })
      timersRef.current.delete(action.id)
    }, timeUntilExpiry)

    timersRef.current.set(action.id, timer)
  }, [])

  const push = useCallback(<T,>(
    type: string,
    description: string,
    undoFn: () => void | Promise<void>,
    data?: T
  ): UndoableAction<T> => {
    const now = Date.now()
    const action: UndoableAction<T> = {
      id: `undo-${now}-${Math.random().toString(36).slice(RANDOM_ID.SLICE_START, RANDOM_ID.SLICE_END_SHORT)}`,
      type,
      description,
      undo: undoFn,
      data,
      createdAt: now,
      expiresAt: now + expireTime,
    }

    setStack((prev) => {
      // Add to front, enforce max size
      const next = [action, ...prev].slice(0, maxSize)
      return next
    })

    scheduleExpiry(action)
    return action
  }, [expireTime, maxSize, scheduleExpiry])

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setStack((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const undoById = useCallback(async (id: string): Promise<boolean> => {
    const action = stack.find((a) => a.id === id)
    if (!action) return false

    try {
      await action.undo()
      dismiss(id)
      return true
    } catch (error) {
      console.error('[useUndoStack] Undo failed:', error)
      dismiss(id)
      return false
    }
  }, [stack, dismiss])

  const undoLast = useCallback(async (): Promise<boolean> => {
    const action = stack[0]
    if (!action) return false
    return undoById(action.id)
  }, [stack, undoById])

  const clear = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current.clear()
    setStack([])
  }, [])

  return {
    stack,
    push,
    undoLast,
    undoById,
    dismiss,
    clear,
    canUndo: stack.length > 0,
    lastAction: stack[0] ?? null,
  }
}
