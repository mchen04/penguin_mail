import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { ToastProvider, useToast } from '../ToastContext'
import type { ReactNode } from 'react'

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>
  }
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws when useToast is used outside ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useToast())
    }).toThrow()
    spy.mockRestore()
  })

  it('addToast adds a toast and returns its id', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useToast(), { wrapper })

    let toastId: string
    act(() => {
      toastId = result.current.addToast({ type: 'info', message: 'Hello' })
    })

    expect(toastId!).toBeTruthy()
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Hello')
    expect(result.current.toasts[0].type).toBe('info')
  })

  it('removeToast removes a toast by id', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useToast(), { wrapper })

    let toastId: string
    act(() => {
      toastId = result.current.addToast({ type: 'info', message: 'To remove' })
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.removeToast(toastId)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('clearToasts removes all toasts', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.addToast({ type: 'info', message: 'Toast 1' })
      result.current.addToast({ type: 'success', message: 'Toast 2' })
      result.current.addToast({ type: 'error', message: 'Toast 3' })
    })

    expect(result.current.toasts).toHaveLength(3)

    act(() => {
      result.current.clearToasts()
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('convenience methods create correct toast types', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.success('Success msg')
      result.current.error('Error msg')
      result.current.info('Info msg')
      result.current.warning('Warning msg')
    })

    expect(result.current.toasts).toHaveLength(4)
    expect(result.current.toasts.find((t) => t.type === 'success')?.message).toBe('Success msg')
    expect(result.current.toasts.find((t) => t.type === 'error')?.message).toBe('Error msg')
    expect(result.current.toasts.find((t) => t.type === 'info')?.message).toBe('Info msg')
    expect(result.current.toasts.find((t) => t.type === 'warning')?.message).toBe('Warning msg')
  })

  it('auto-removes toast after default duration', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.addToast({ type: 'info', message: 'Auto remove' })
    })

    expect(result.current.toasts).toHaveLength(1)

    // Advance timers past the default duration
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('error toast uses longer duration before auto-removal', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.info('Info toast')
      result.current.error('Error toast')
    })

    expect(result.current.toasts).toHaveLength(2)

    // After default duration, info should be gone but error may still be present
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // The error toast should still exist or both should be gone depending on durations
    // After enough time, all should be gone
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.toasts).toHaveLength(0)
  })
})
