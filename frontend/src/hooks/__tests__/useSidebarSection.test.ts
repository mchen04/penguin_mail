import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSidebarSection } from '../useSidebarSection'

const defaultOptions = {
  items: [],
  colors: ['red', 'blue', 'green'] as const,
  onAdd: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
  onSelect: vi.fn(),
}

describe('useSidebarSection', () => {
  it('starts expanded', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))
    expect(result.current.isExpanded).toBe(true)
  })

  it('toggles expand', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))
    act(() => {
      result.current.handleToggleExpand()
    })
    expect(result.current.isExpanded).toBe(false)
    act(() => {
      result.current.handleToggleExpand()
    })
    expect(result.current.isExpanded).toBe(true)
  })

  it('starts create mode', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))
    expect(result.current.isCreating).toBe(false)
    act(() => {
      result.current.handleStartCreate()
    })
    expect(result.current.isCreating).toBe(true)
    expect(result.current.newName).toBe('')
  })

  it('cancels create mode', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))
    act(() => {
      result.current.handleStartCreate()
    })
    act(() => {
      result.current.handleCancelCreate()
    })
    expect(result.current.isCreating).toBe(false)
  })

  it('creates item on handleCreate', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onAdd }))

    act(() => {
      result.current.handleStartCreate()
      result.current.setNewName('Test Item')
    })

    await act(async () => {
      await result.current.handleCreate()
    })

    expect(onAdd).toHaveBeenCalledWith('Test Item', expect.any(String))
    expect(result.current.isCreating).toBe(false)
  })

  it('does not create with empty name', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onAdd }))

    act(() => {
      result.current.handleStartCreate()
    })

    await act(async () => {
      await result.current.handleCreate()
    })

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('calls onSelect on item click', () => {
    const onSelect = vi.fn()
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onSelect }))

    act(() => {
      result.current.handleItemClick('item-1')
    })

    expect(onSelect).toHaveBeenCalledWith('item-1')
  })
})
