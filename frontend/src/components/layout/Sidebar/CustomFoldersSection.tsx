/**
 * Custom Folders Section Component
 * Displays and manages custom email folders in the sidebar
 */

import { useFolders } from '@/context/OrganizationContext'
import { useEmail } from '@/context/EmailContext'
import { useSidebarSection } from '@/hooks'
import { Icon } from '@/components/common/Icon/Icon'
import { FOLDER_COLORS, ICON_SIZE } from '@/constants'
import styles from './SidebarSection.module.css'

export function CustomFoldersSection() {
  const { folders, addFolder, updateFolder, deleteFolder, getRootFolders } = useFolders()
  const { setFolder, currentFolder } = useEmail()

  const rootFolders = getRootFolders()

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
    handleItemClick,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    handleColorChange,
  } = useSidebarSection({
    items: folders,
    colors: FOLDER_COLORS,
    onAdd: addFolder,
    onUpdate: updateFolder,
    onDelete: deleteFolder,
    onSelect: setFolder,
  })

  if (folders.length === 0 && !isCreating) {
    return null
  }

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.expandButton} onClick={handleToggleExpand}>
          <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={ICON_SIZE.SMALL} />
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
                placeholder="Folder name"
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

          {/* Folder items */}
          {rootFolders.map((folder) => (
            <div
              key={folder.id}
              className={styles.item}
              data-selected={folder.id === currentFolder}
              onClick={() => handleItemClick(folder.id)}
            >
              {editingId === folder.id ? (
                <div className={styles.editForm}>
                  <div className={styles.colorPicker}>
                    {colors.map((color) => (
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
                      onClick={(e) => handleDelete(e, folder.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Icon name="folder" size={ICON_SIZE.SMALL} style={{ color: folder.color }} />
                  <span className={styles.itemName}>{folder.name}</span>
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
