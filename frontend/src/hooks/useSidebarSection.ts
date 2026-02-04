/**
 * Custom hook for managing sidebar editable sections (labels, folders)
 * Extracts common state and handlers for CRUD operations on sidebar items
 */

import { useState, useCallback } from 'react'

export interface SidebarItem {
  id: string
  name: string
  color: string
}

interface UseSidebarSectionOptions<T extends SidebarItem> {
  items: T[]
  colors: readonly string[]
  onAdd: (name: string, color: string) => Promise<void>
  onUpdate: (id: string, updates: Partial<T>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSelect: (id: string) => void
}

export function useSidebarSection<T extends SidebarItem>({
  colors,
  onAdd,
  onUpdate,
  onDelete,
  onSelect,
}: UseSidebarSectionOptions<T>) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<string>(colors[0])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleStartCreate = useCallback(() => {
    setIsCreating(true)
    setNewName('')
    setNewColor(colors[Math.floor(Math.random() * colors.length)])
  }, [colors])

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false)
    setNewName('')
  }, [])

  const handleCreate = useCallback(async () => {
    if (newName.trim()) {
      await onAdd(newName.trim(), newColor)
      setIsCreating(false)
      setNewName('')
    }
  }, [onAdd, newName, newColor])

  const handleItemClick = useCallback(
    (id: string) => {
      onSelect(id)
    },
    [onSelect]
  )

  const handleStartEdit = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setEditingId(id)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleSaveEdit = useCallback(
    async (id: string, name: string) => {
      if (name.trim()) {
        await onUpdate(id, { name: name.trim() } as Partial<T>)
      }
      setEditingId(null)
    },
    [onUpdate]
  )

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      await onDelete(id)
    },
    [onDelete]
  )

  const handleColorChange = useCallback(
    async (id: string, color: string) => {
      await onUpdate(id, { color } as Partial<T>)
    },
    [onUpdate]
  )

  return {
    // State
    isExpanded,
    isCreating,
    editingId,
    newName,
    newColor,
    colors,

    // State setters for controlled inputs
    setNewName,
    setNewColor,

    // Handlers
    handleToggleExpand,
    handleStartCreate,
    handleCancelCreate,
    handleCreate,
    handleItemClick,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleColorChange,
  }
}
