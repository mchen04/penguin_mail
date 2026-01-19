import { useState, useRef, useEffect } from 'react'
import { IconButton } from '@/components/common/IconButton/IconButton'
import { Icon } from '@/components/common/Icon/Icon'
import { ICON_SIZE } from '@/constants'
import type { FolderType } from '@/types/email'
import styles from './BulkActions.module.css'

const MOVE_FOLDERS: { id: FolderType; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'archive', label: 'Archive' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'spam', label: 'Spam' },
  { id: 'trash', label: 'Trash' },
]

interface BulkActionsProps {
  hasSelection: boolean
  onArchive?: () => void
  onDelete?: () => void
  onMarkRead?: () => void
  isTrash?: boolean
  isSpam?: boolean
  onMarkAsSpam?: () => void
  onMarkNotSpam?: () => void
  onMoveToFolder?: (folder: FolderType) => void
}

export function BulkActions({
  hasSelection,
  onArchive,
  onDelete,
  onMarkRead,
  isTrash = false,
  isSpam = false,
  onMarkAsSpam,
  onMarkNotSpam,
  onMoveToFolder,
}: BulkActionsProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoveMenu(false)
      }
    }
    if (showMoveMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMoveMenu])

  const handleMove = (folder: FolderType) => {
    onMoveToFolder?.(folder)
    setShowMoveMenu(false)
  }

  return (
    <div className={styles.bulkActions} data-disabled={!hasSelection}>
      {/* Show "Not spam" button in spam folder */}
      {isSpam && (
        <IconButton
          icon="inbox"
          label="Not spam"
          onClick={onMarkNotSpam}
          disabled={!hasSelection}
        />
      )}
      {/* Hide archive in trash/spam */}
      {!isTrash && !isSpam && (
        <IconButton
          icon="archive"
          label="Archive"
          onClick={onArchive}
          disabled={!hasSelection}
        />
      )}
      <IconButton
        icon="trash"
        label={isTrash ? 'Delete permanently' : 'Delete'}
        onClick={onDelete}
        disabled={!hasSelection}
      />
      <IconButton
        icon="mailOpen"
        label="Mark as read"
        onClick={onMarkRead}
        disabled={!hasSelection}
      />
      {/* Move to folder dropdown */}
      <div className={styles.moveDropdown} ref={menuRef}>
        <IconButton
          icon="folder"
          label="Move to folder"
          onClick={() => setShowMoveMenu(!showMoveMenu)}
          disabled={!hasSelection}
        />
        {showMoveMenu && hasSelection && (
          <div className={styles.moveMenu}>
            {MOVE_FOLDERS.map((folder) => (
              <button
                key={folder.id}
                type="button"
                className={styles.moveMenuItem}
                onClick={() => handleMove(folder.id)}
              >
                <Icon name="folder" size={ICON_SIZE.SMALL} />
                {folder.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Show spam button outside of spam/trash folders */}
      {!isTrash && !isSpam && (
        <IconButton
          icon="mail"
          label="Mark as spam"
          onClick={onMarkAsSpam}
          disabled={!hasSelection}
        />
      )}
    </div>
  )
}
