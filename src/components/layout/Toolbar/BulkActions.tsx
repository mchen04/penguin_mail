import { IconButton } from '@/components/common/IconButton/IconButton'
import styles from './BulkActions.module.css'

interface BulkActionsProps {
  hasSelection: boolean
  onArchive?: () => void
  onDelete?: () => void
  onMarkRead?: () => void
  onMarkUnread?: () => void
}

export function BulkActions({
  hasSelection,
  onArchive,
  onDelete,
  onMarkRead,
}: BulkActionsProps) {
  return (
    <div className={styles.bulkActions} data-disabled={!hasSelection}>
      <IconButton
        icon="archive"
        label="Archive"
        onClick={onArchive}
        disabled={!hasSelection}
      />
      <IconButton
        icon="trash"
        label="Delete"
        onClick={onDelete}
        disabled={!hasSelection}
      />
      <IconButton
        icon="mailOpen"
        label="Mark as read"
        onClick={onMarkRead}
        disabled={!hasSelection}
      />
    </div>
  )
}
