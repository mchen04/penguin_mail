import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClickOutside } from '../useClickOutside'

describe('useClickOutside', () => {
  it('calls handler when clicking outside', () => {
    const handler = vi.fn()
    const element = document.createElement('div')
    document.body.appendChild(element)
    const ref = { current: element }

    renderHook(() => useClickOutside(ref, handler))

    // Click outside
    const outside = new MouseEvent('mousedown', { bubbles: true })
    document.body.dispatchEvent(outside)

    expect(handler).toHaveBeenCalledOnce()
    document.body.removeChild(element)
  })

  it('does not call handler when clicking inside', () => {
    const handler = vi.fn()
    const element = document.createElement('div')
    document.body.appendChild(element)
    const ref = { current: element }

    renderHook(() => useClickOutside(ref, handler))

    // Click inside
    const inside = new MouseEvent('mousedown', { bubbles: true })
    element.dispatchEvent(inside)

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(element)
  })

  it('does not call handler when disabled', () => {
    const handler = vi.fn()
    const element = document.createElement('div')
    document.body.appendChild(element)
    const ref = { current: element }

    renderHook(() => useClickOutside(ref, handler, false))

    const outside = new MouseEvent('mousedown', { bubbles: true })
    document.body.dispatchEvent(outside)

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(element)
  })

  it('does not call handler after unmount (cleanup removes listener)', () => {
    const handler = vi.fn()
    const element = document.createElement('div')
    document.body.appendChild(element)
    const ref = { current: element }

    const { unmount } = renderHook(() => useClickOutside(ref, handler))

    unmount()

    const outside = new MouseEvent('mousedown', { bubbles: true })
    document.body.dispatchEvent(outside)

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(element)
  })
})
