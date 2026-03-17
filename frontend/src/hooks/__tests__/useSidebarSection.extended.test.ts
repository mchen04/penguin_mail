/**
 * Extended tests for useSidebarSection covering edit, delete, and colorChange handlers
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSidebarSection } from '../useSidebarSection'

const defaultOptions = {
  items: [{ id: 'item-1', name: 'Test Item', color: 'red' }],
  colors: ['red', 'blue', 'green'] as const,
  onAdd: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
  onSelect: vi.fn(),
}

describe('useSidebarSection - Edit handlers', () => {
  it('handleStartEdit sets editingId to the given id', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent
    act(() => {
      result.current.handleStartEdit(mockEvent, 'item-1')
    })

    expect(result.current.editingId).toBe('item-1')
  })

  it('handleStartEdit calls stopPropagation', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent
    act(() => {
      result.current.handleStartEdit(mockEvent, 'item-1')
    })

    expect(mockEvent.stopPropagation).toHaveBeenCalled()
  })

  it('handleCancelEdit clears editingId', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent
    act(() => {
      result.current.handleStartEdit(mockEvent, 'item-1')
    })
    expect(result.current.editingId).toBe('item-1')

    act(() => {
      result.current.handleCancelEdit()
    })
    expect(result.current.editingId).toBeNull()
  })

  it('handleSaveEdit calls onUpdate and clears editingId when name is valid', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onUpdate }))

    await act(async () => {
      await result.current.handleSaveEdit('item-1', 'New Name')
    })

    expect(onUpdate).toHaveBeenCalledWith('item-1', { name: 'New Name' })
    expect(result.current.editingId).toBeNull()
  })

  it('handleSaveEdit does not call onUpdate when name is empty', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onUpdate }))

    await act(async () => {
      await result.current.handleSaveEdit('item-1', '')
    })

    expect(onUpdate).not.toHaveBeenCalled()
    expect(result.current.editingId).toBeNull()
  })

  it('handleSaveEdit trims whitespace from name', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onUpdate }))

    await act(async () => {
      await result.current.handleSaveEdit('item-1', '  Trimmed Name  ')
    })

    expect(onUpdate).toHaveBeenCalledWith('item-1', { name: 'Trimmed Name' })
  })
})

describe('useSidebarSection - Delete handler', () => {
  it('handleDelete calls onDelete with the given id', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onDelete }))

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent
    await act(async () => {
      await result.current.handleDelete(mockEvent, 'item-1')
    })

    expect(onDelete).toHaveBeenCalledWith('item-1')
  })

  it('handleDelete calls stopPropagation', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onDelete }))

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent
    await act(async () => {
      await result.current.handleDelete(mockEvent, 'item-1')
    })

    expect(mockEvent.stopPropagation).toHaveBeenCalled()
  })
})

describe('useSidebarSection - Color change handler', () => {
  it('handleColorChange calls onUpdate with the new color', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions, onUpdate }))

    await act(async () => {
      await result.current.handleColorChange('item-1', 'blue')
    })

    expect(onUpdate).toHaveBeenCalledWith('item-1', { color: 'blue' })
  })
})

describe('useSidebarSection - setNewColor', () => {
  it('setNewColor updates the newColor state', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))

    act(() => {
      result.current.setNewColor('green')
    })

    expect(result.current.newColor).toBe('green')
  })

  it('handleStartCreate picks a random color from colors array', () => {
    const { result } = renderHook(() => useSidebarSection({ ...defaultOptions }))

    act(() => {
      result.current.handleStartCreate()
    })

    const colors = ['red', 'blue', 'green']
    expect(colors).toContain(result.current.newColor)
  })
})
