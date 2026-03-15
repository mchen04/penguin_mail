import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoStack } from '../useUndoStack'

describe('useUndoStack', () => {
  it('starts with empty stack', () => {
    const { result } = renderHook(() => useUndoStack())
    expect(result.current.stack).toHaveLength(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.lastAction).toBeNull()
  })

  it('push adds an action to the stack', () => {
    const { result } = renderHook(() => useUndoStack())
    act(() => {
      result.current.push('delete', 'Deleted email', vi.fn())
    })
    expect(result.current.stack).toHaveLength(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.lastAction?.type).toBe('delete')
  })

  it('undoLast calls the undo function and removes from stack', async () => {
    const undoFn = vi.fn()
    const { result } = renderHook(() => useUndoStack())
    act(() => {
      result.current.push('delete', 'Deleted', undoFn)
    })
    let success = false
    await act(async () => {
      success = await result.current.undoLast()
    })
    expect(success).toBe(true)
    expect(undoFn).toHaveBeenCalledOnce()
    expect(result.current.stack).toHaveLength(0)
  })

  it('undoById undoes a specific action', async () => {
    const undo1 = vi.fn()
    const undo2 = vi.fn()
    const { result } = renderHook(() => useUndoStack())

    let action1: ReturnType<typeof result.current.push>
    act(() => {
      action1 = result.current.push('delete', 'First', undo1)
      result.current.push('archive', 'Second', undo2)
    })

    await act(async () => {
      await result.current.undoById(action1!.id)
    })
    expect(undo1).toHaveBeenCalled()
    expect(undo2).not.toHaveBeenCalled()
  })

  it('dismiss removes without calling undo', () => {
    const undoFn = vi.fn()
    const { result } = renderHook(() => useUndoStack())
    let action: ReturnType<typeof result.current.push>
    act(() => {
      action = result.current.push('delete', 'Deleted', undoFn)
    })
    act(() => {
      result.current.dismiss(action!.id)
    })
    expect(result.current.stack).toHaveLength(0)
    expect(undoFn).not.toHaveBeenCalled()
  })

  it('clear removes all actions', () => {
    const { result } = renderHook(() => useUndoStack())
    act(() => {
      result.current.push('a', 'First', vi.fn())
      result.current.push('b', 'Second', vi.fn())
    })
    act(() => {
      result.current.clear()
    })
    expect(result.current.stack).toHaveLength(0)
    expect(result.current.canUndo).toBe(false)
  })

  it('respects maxSize', () => {
    const { result } = renderHook(() => useUndoStack({ maxSize: 2 }))
    act(() => {
      result.current.push('a', 'First', vi.fn())
      result.current.push('b', 'Second', vi.fn())
      result.current.push('c', 'Third', vi.fn())
    })
    expect(result.current.stack).toHaveLength(2)
    // Most recent should be first
    expect(result.current.stack[0].type).toBe('c')
  })

  it('auto-expires actions', async () => {
    vi.useFakeTimers()
    const onExpire = vi.fn()
    const { result } = renderHook(() =>
      useUndoStack({ expireTime: 100, onExpire })
    )
    act(() => {
      result.current.push('delete', 'Deleted', vi.fn())
    })
    expect(result.current.stack).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(result.current.stack).toHaveLength(0)
    expect(onExpire).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('undoLast returns false on empty stack', async () => {
    const { result } = renderHook(() => useUndoStack())
    let success = false
    await act(async () => {
      success = await result.current.undoLast()
    })
    expect(success).toBe(false)
  })
})
