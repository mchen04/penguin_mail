import { memo } from 'react'
import type { Email } from '@/types/email'
import { ACCOUNT_COLOR_VAR } from '@/types/account'
import { Checkbox } from '@/components/common/Checkbox/Checkbox'
import { IconButton } from '@/components/common/IconButton/IconButton'
import { Icon } from '@/components/common/Icon/Icon'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import styles from './EmailRow.module.css'

interface EmailRowProps {
  email: Email
  isSelected: boolean
  onSelect: (shiftKey: boolean) => void
  onOpen: () => void
  onToggleStar: () => void
  onArchive: () => void
  onDelete: () => void
  onMarkRead: () => void
}

export const EmailRow = memo(function EmailRow({
  email,
  isSelected,
  onSelect,
  onOpen,
  onToggleStar,
  onArchive,
  onDelete,
  onMarkRead,
}: EmailRowProps) {
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't open if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, input, label')) {
      return
    }
    onOpen()
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.nativeEvent instanceof MouseEvent && e.nativeEvent.shiftKey)
  }

  const accountColorVar = ACCOUNT_COLOR_VAR[email.accountColor]

  return (
    <div
      className={cn(
        styles.row,
        !email.isRead && styles.unread,
        isSelected && styles.selected
      )}
      onClick={handleRowClick}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      {/* Checkbox */}
      <div className={styles.checkbox}>
        <Checkbox
          checked={isSelected}
          onChange={handleCheckboxChange}
          aria-label={`Select email from ${email.from.name}`}
        />
      </div>

      {/* Star */}
      <button
        className={cn(styles.star, email.isStarred && styles.starred)}
        onClick={(e) => {
          e.stopPropagation()
          onToggleStar()
        }}
        aria-label={email.isStarred ? 'Unstar email' : 'Star email'}
        aria-pressed={email.isStarred}
      >
        <Icon name={email.isStarred ? 'starFilled' : 'star'} size={18} />
      </button>

      {/* Account color indicator */}
      <span
        className={styles.colorIndicator}
        style={{ backgroundColor: accountColorVar }}
        role="img"
        aria-label={`${email.accountColor} account indicator`}
      />

      {/* Sender */}
      <span className={styles.sender}>{email.from.name}</span>

      {/* Subject + Preview */}
      <span className={styles.content}>
        <span className={styles.subject}>{email.subject}</span>
        <span className={styles.preview}> — {email.preview}</span>
      </span>

      {/* Attachment icon */}
      {email.hasAttachment && (
        <span className={styles.attachment} aria-label="Has attachment">
          <Icon name="attachment" size={16} />
        </span>
      )}

      {/* Date */}
      <span className={styles.date}>{formatDate(email.date)}</span>

      {/* Quick actions (visible on hover) */}
      <div className={styles.quickActions}>
        <IconButton
          icon="archive"
          label="Archive"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onArchive()
          }}
        />
        <IconButton
          icon="trash"
          label="Delete"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        />
        <IconButton
          icon={email.isRead ? 'mail' : 'mailOpen'}
          label={email.isRead ? 'Mark as unread' : 'Mark as read'}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onMarkRead()
          }}
        />
      </div>
    </div>
  )
})
