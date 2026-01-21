/**
 * Labels Section Component
 * Displays and manages email labels in the sidebar
 */

import { useLabels } from '@/context/OrganizationContext'
import { useEmail } from '@/context/EmailContext'
import { useSidebarSection } from '@/hooks'
import { Icon } from '@/components/common/Icon/Icon'
import { LABEL_COLORS, ICON_SIZE } from '@/constants'
import styles from './SidebarSection.module.css'

export function LabelsSection() {
  const { labels, addLabel, updateLabel, deleteLabel, selectLabel, selectedLabelId } = useLabels()
  const { setFolder } = useEmail()

  const {
    isExpanded,
    isCreating,
    editingId,
    newName,
    newColor,
    colors,
    setNewName,
    setNewColor,
    handleToggleExpand,
    handleStartCreate,
    handleCancelCreate,
    handleCreate,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleColorChange,
  } = useSidebarSection({
    items: labels,
    colors: LABEL_COLORS,
    onAdd: addLabel,
    onUpdate: updateLabel,
    onDelete: deleteLabel,
    onSelect: (labelId) => {
      selectLabel(labelId)
      setFolder('inbox')
    },
  })

  const handleLabelClick = (labelId: string) => {
    selectLabel(labelId)
    setFolder('inbox')
  }

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.expandButton} onClick={handleToggleExpand}>
          <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={ICON_SIZE.SMALL} />
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
                {colors.map((color) => (
                  <button
                    key={color}
                    className={styles.colorOption}
                    style={{ backgroundColor: color }}
                    data-selected={color === newColor}
                    onClick={() => setNewColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <input
                type="text"
                className={styles.input}
                placeholder="Label name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
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
                  onClick={handleCreate}
                  disabled={!newName.trim()}
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
              className={styles.item}
              data-selected={label.id === selectedLabelId}
              onClick={() => handleLabelClick(label.id)}
            >
              {editingId === label.id ? (
                <div className={styles.editForm}>
                  <div className={styles.colorPicker}>
                    {colors.map((color) => (
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
                      onClick={(e) => handleDelete(e, label.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span
                    className={styles.itemColor}
                    style={{ backgroundColor: label.color }}
                  />
                  <span className={styles.itemName}>{label.name}</span>
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
