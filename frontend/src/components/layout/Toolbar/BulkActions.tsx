import { useState, useRef } from 'react'
import { IconButton } from '@/components/common/IconButton/IconButton'
import { Icon } from '@/components/common/Icon/Icon'
import { SnoozePicker } from '@/components/email/SnoozePicker'
import { useClickOutside } from '@/hooks'
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
  isSnoozed?: boolean
  onMarkAsSpam?: () => void
  onMarkNotSpam?: () => void
  onMoveToFolder?: (folder: FolderType) => void
  onSnooze?: (snoozeUntil: Date) => void
}

export function BulkActions({
  hasSelection,
  onArchive,
  onDelete,
  onMarkRead,
  isTrash = false,
  isSpam = false,
  isSnoozed = false,
  onMarkAsSpam,
  onMarkNotSpam,
  onMoveToFolder,
  onSnooze,
}: BulkActionsProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const snoozeRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useClickOutside(menuRef, () => setShowMoveMenu(false), showMoveMenu)
  useClickOutside(snoozeRef, () => setShowSnoozeMenu(false), showSnoozeMenu)

  const handleMove = (folder: FolderType) => {
    onMoveToFolder?.(folder)
    setShowMoveMenu(false)
  }

  const handleSnooze = (snoozeUntil: Date) => {
    onSnooze?.(snoozeUntil)
    setShowSnoozeMenu(false)
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
      {/* Snooze dropdown - show outside of snoozed/trash/spam folders */}
      {!isTrash && !isSpam && !isSnoozed && onSnooze && (
        <div className={styles.snoozeDropdown} ref={snoozeRef}>
          <IconButton
            icon="clock"
            label="Snooze"
            onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
            disabled={!hasSelection}
          />
          {showSnoozeMenu && hasSelection && (
            <div className={styles.snoozeMenu}>
              <SnoozePicker
                onSnooze={handleSnooze}
                onCancel={() => setShowSnoozeMenu(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
