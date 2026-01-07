import type { Email } from '@/types/email'
import { IconButton } from '@/components/common/IconButton/IconButton'
import { formatFullDate } from '@/utils/formatDate'
import { ACCOUNT_COLOR_VAR } from '@/types/account'
import styles from './EmailHeader.module.css'

interface EmailHeaderProps {
  email: Email
  onBack: () => void
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onArchive: () => void
  onDelete: () => void
  onToggleStar: () => void
}

export function EmailHeader({
  email,
  onBack,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  onToggleStar,
}: EmailHeaderProps) {
  const accountColorVar = ACCOUNT_COLOR_VAR[email.accountColor]

  return (
    <div className={styles.header}>
      {/* Top row: back button, subject, actions */}
      <div className={styles.topRow}>
        <IconButton
          icon="arrowLeft"
          label="Back to inbox"
          onClick={onBack}
        />

        <h1 className={styles.subject}>{email.subject}</h1>

        <div className={styles.actions}>
          <IconButton
            icon="archive"
            label="Archive"
            onClick={onArchive}
          />
          <IconButton
            icon="trash"
            label="Delete"
            onClick={onDelete}
          />
          <IconButton
            icon={email.isStarred ? 'starFilled' : 'star'}
            label={email.isStarred ? 'Unstar' : 'Star'}
            onClick={onToggleStar}
          />
          <IconButton
            icon="moreVertical"
            label="More actions"
          />
        </div>
      </div>

      {/* Sender info row */}
      <div className={styles.senderRow}>
        {/* Account color indicator */}
        <span
          className={styles.colorIndicator}
          style={{ backgroundColor: `var(${accountColorVar})` }}
        />

        {/* Sender avatar placeholder */}
        <div className={styles.avatar}>
          {email.from.name.charAt(0).toUpperCase()}
        </div>

        <div className={styles.senderInfo}>
          <div className={styles.senderName}>
            <strong>{email.from.name}</strong>
            <span className={styles.senderEmail}>&lt;{email.from.email}&gt;</span>
          </div>
          <div className={styles.recipients}>
            to {email.to.map((r) => r.name || r.email).join(', ')}
            {email.cc && email.cc.length > 0 && (
              <span>, cc: {email.cc.map((r) => r.name || r.email).join(', ')}</span>
            )}
          </div>
        </div>

        <div className={styles.dateAndReply}>
          <span className={styles.date}>{formatFullDate(email.date)}</span>
          <div className={styles.replyActions}>
            <IconButton
              icon="reply"
              label="Reply"
              onClick={onReply}
            />
            <IconButton
              icon="replyAll"
              label="Reply all"
              onClick={onReplyAll}
            />
            <IconButton
              icon="forward"
              label="Forward"
              onClick={onForward}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
