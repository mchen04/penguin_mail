/**
 * Labels Section Component
 * Displays and manages email labels in the sidebar
 */

import { useState, useCallback } from 'react'
import { useLabels } from '@/context/OrganizationContext'
import { useEmail } from '@/context/EmailContext'
import { Icon } from '@/components/common/Icon/Icon'
import { LABEL_COLORS, ICON_SIZE } from '@/constants'
import styles from './LabelsSection.module.css'

export function LabelsSection() {
  const { labels, addLabel, updateLabel, deleteLabel, selectLabel, selectedLabelId } = useLabels()
  const { setFolder } = useEmail()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[0])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleStartCreate = useCallback(() => {
    setIsCreating(true)
    setNewLabelName('')
    setNewLabelColor(LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)])
  }, [])

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false)
    setNewLabelName('')
  }, [])

  const handleCreateLabel = useCallback(async () => {
    if (newLabelName.trim()) {
      await addLabel(newLabelName.trim(), newLabelColor)
      setIsCreating(false)
      setNewLabelName('')
    }
  }, [addLabel, newLabelName, newLabelColor])

  const handleLabelClick = useCallback(
    (labelId: string) => {
      selectLabel(labelId)
      // Labels could filter by label in the future
      // For now, just select it
      setFolder('inbox')
    },
    [selectLabel, setFolder]
  )

  const handleStartEdit = useCallback((e: React.MouseEvent, labelId: string) => {
    e.stopPropagation()
    setEditingId(labelId)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleSaveEdit = useCallback(
    async (labelId: string, newName: string) => {
      if (newName.trim()) {
        await updateLabel(labelId, { name: newName.trim() })
      }
      setEditingId(null)
    },
    [updateLabel]
  )

  const handleDeleteLabel = useCallback(
    async (e: React.MouseEvent, labelId: string) => {
      e.stopPropagation()
      await deleteLabel(labelId)
    },
    [deleteLabel]
  )

  const handleColorChange = useCallback(
    async (labelId: string, color: string) => {
      await updateLabel(labelId, { color })
    },
    [updateLabel]
  )

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.expandButton} onClick={handleToggleExpand}>
          <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={ICON_SIZE.SMALL} />
          <span className={styles.title}>Labels</span>
        </button>
        <button
          className={styles.addButton}
          onClick={handleStartCreate}
          title="Create new label"
        >
          <Icon name="plus" size={ICON_SIZE.SMALL} />
        </button>
      </div>

      {/* Labels list */}
      {isExpanded && (
        <div className={styles.list}>
          {/* Create new label form */}
          {isCreating && (
            <div className={styles.createForm}>
              <div className={styles.colorPicker}>
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    className={styles.colorOption}
                    style={{ backgroundColor: color }}
                    data-selected={color === newLabelColor}
                    onClick={() => setNewLabelColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <input
                type="text"
                className={styles.input}
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateLabel()
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
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Label items */}
          {labels.length === 0 && !isCreating && (
            <div className={styles.emptyState}>No labels yet</div>
          )}

          {labels.map((label) => (
            <div
              key={label.id}
              className={styles.labelItem}
              data-selected={label.id === selectedLabelId}
              onClick={() => handleLabelClick(label.id)}
            >
              {editingId === label.id ? (
                <div className={styles.editForm}>
                  <div className={styles.colorPicker}>
                    {LABEL_COLORS.map((color) => (
                      <button
                        key={color}
                        className={styles.colorOption}
                        style={{ backgroundColor: color }}
                        data-selected={color === label.color}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleColorChange(label.id, color)
                        }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    defaultValue={label.name}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(label.id, (e.target as HTMLInputElement).value)
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
                      onClick={(e) => handleDeleteLabel(e, label.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span
                    className={styles.labelColor}
                    style={{ backgroundColor: label.color }}
                  />
                  <span className={styles.labelName}>{label.name}</span>
                  <button
                    className={styles.editButton}
                    onClick={(e) => handleStartEdit(e, label.id)}
                    title="Edit label"
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
