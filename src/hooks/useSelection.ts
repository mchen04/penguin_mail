import { useState, useCallback, useRef } from 'react'

interface UseSelectionOptions<T> {
  items: T[]
  getItemId: (item: T) => string
}

interface UseSelectionReturn {
  selectedIds: Set<string>
  isSelected: (id: string) => boolean
  toggle: (id: string, shiftKey?: boolean) => void
  selectAll: () => void
  clearSelection: () => void
  selectRange: (fromId: string, toId: string) => void
}

export function useSelection<T>({
  items,
  getItemId,
}: UseSelectionOptions<T>): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const lastSelectedId = useRef<string | null>(null)

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const toggle = useCallback(
    (id: string, shiftKey = false) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)

        // Shift+click for range selection
        if (shiftKey && lastSelectedId.current) {
          const ids = items.map(getItemId)
          const startIndex = ids.indexOf(lastSelectedId.current)
          const endIndex = ids.indexOf(id)

          if (startIndex !== -1 && endIndex !== -1) {
            const [from, to] =
              startIndex < endIndex
                ? [startIndex, endIndex]
                : [endIndex, startIndex]

            for (let i = from; i <= to; i++) {
              next.add(ids[i])
            }
            return next
          }
        }

        // Regular toggle
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }

        lastSelectedId.current = id
        return next
      })
    },
    [items, getItemId]
  )

  const selectAll = useCallback(() => {
    const allIds = new Set(items.map(getItemId))
    setSelectedIds(allIds)
  }, [items, getItemId])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    lastSelectedId.current = null
  }, [])

  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      const ids = items.map(getItemId)
      const startIndex = ids.indexOf(fromId)
      const endIndex = ids.indexOf(toId)

      if (startIndex !== -1 && endIndex !== -1) {
        const [from, to] =
          startIndex < endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex]

        const rangeIds = new Set<string>()
        for (let i = from; i <= to; i++) {
          rangeIds.add(ids[i])
        }
        setSelectedIds(rangeIds)
      }
    },
    [items, getItemId]
  )

  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    clearSelection,
    selectRange,
  }
}
