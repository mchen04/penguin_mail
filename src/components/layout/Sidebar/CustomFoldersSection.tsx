/**
 * Custom Folders Section Component
 * Displays and manages custom email folders in the sidebar
 */

import { useState, useCallback } from 'react'
import { useFolders } from '@/context/OrganizationContext'
import { useEmail } from '@/context/EmailContext'
import { Icon } from '@/components/common/Icon/Icon'
import { FOLDER_COLORS, ICON_SIZE } from '@/constants'
import styles from './CustomFoldersSection.module.css'

export function CustomFoldersSection() {
  const { folders, addFolder, updateFolder, deleteFolder, getRootFolders } = useFolders()
  const { setFolder, currentFolder } = useEmail()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState<string>(FOLDER_COLORS[0])

  const rootFolders = getRootFolders()

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleStartCreate = useCallback(() => {
    setIsCreating(true)
    setNewFolderName('')
    setNewFolderColor(FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)])
  }, [])

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false)
    setNewFolderName('')
  }, [])

  const handleCreateFolder = useCallback(async () => {
    if (newFolderName.trim()) {
      await addFolder(newFolderName.trim(), newFolderColor)
      setIsCreating(false)
      setNewFolderName('')
    }
  }, [addFolder, newFolderName, newFolderColor])

  const handleFolderClick = useCallback(
    (folderId: string) => {
      setFolder(folderId)
    },
    [setFolder]
  )

  const handleStartEdit = useCallback((e: React.MouseEvent, folderId: string) => {
    e.stopPropagation()
    setEditingId(folderId)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleSaveEdit = useCallback(
    async (folderId: string, newName: string) => {
      if (newName.trim()) {
        await updateFolder(folderId, { name: newName.trim() })
      }
      setEditingId(null)
    },
    [updateFolder]
  )

  const handleDeleteFolder = useCallback(
    async (e: React.MouseEvent, folderId: string) => {
      e.stopPropagation()
      await deleteFolder(folderId)
    },
    [deleteFolder]
  )

  const handleColorChange = useCallback(
    async (folderId: string, color: string) => {
      await updateFolder(folderId, { color })
    },
    [updateFolder]
  )

  if (folders.length === 0 && !isCreating) {
    return null
  }

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.expandButton} onClick={handleToggleExpand}>
          <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={ICON_SIZE.SMALL} />
          <span className={styles.title}>Folders</span>
        </button>
        <button
          className={styles.addButton}
          onClick={handleStartCreate}
          title="Create new folder"
        >
          <Icon name="plus" size={ICON_SIZE.SMALL} />
        </button>
      </div>

      {/* Folders list */}
      {isExpanded && (
        <div className={styles.list}>
          {/* Create new folder form */}
          {isCreating && (
            <div className={styles.createForm}>
              <div className={styles.colorPicker}>
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    className={styles.colorOption}
                    style={{ backgroundColor: color }}
                    data-selected={color === newFolderColor}
                    onClick={() => setNewFolderColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <input
                type="text"
                className={styles.input}
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder()
                  if (e.key === 'Escape') handleCancelCreate()
                }}
                autoFocus
              />
              <div className={styles.formActions}>
                <button className={styles.cancelButton} onClick={handleCancelCreate}>
                  Cancel
                </button>
                <button
                  className={styles.saveButton}
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Folder items */}
          {rootFolders.map((folder) => (
            <div
              key={folder.id}
              className={styles.folderItem}
              data-selected={folder.id === currentFolder}
              onClick={() => handleFolderClick(folder.id)}
            >
              {editingId === folder.id ? (
                <div className={styles.editForm}>
                  <div className={styles.colorPicker}>
                    {FOLDER_COLORS.map((color) => (
                      <button
                        key={color}
                        className={styles.colorOption}
                        style={{ backgroundColor: color }}
                        data-selected={color === folder.color}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleColorChange(folder.id, color)
                        }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    defaultValue={folder.name}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(folder.id, (e.target as HTMLInputElement).value)
                      }
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className={styles.formActions}>
                    <button className={styles.cancelButton} onClick={handleCancelEdit}>
                      Cancel
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDeleteFolder(e, folder.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Icon name="folder" size={ICON_SIZE.SMALL} style={{ color: folder.color }} />
                  <span className={styles.folderName}>{folder.name}</span>
                  <button
                    className={styles.editButton}
                    onClick={(e) => handleStartEdit(e, folder.id)}
                    title="Edit folder"
                  >
                    <Icon name="edit" size={ICON_SIZE.XSMALL} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
