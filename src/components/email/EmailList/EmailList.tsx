import { useEmail } from '@/context/EmailContext'
import { EmailRow } from './EmailRow'
import styles from './EmailList.module.css'

export function EmailList() {
  const {
    filteredEmails,
    selectEmail,
    toggleStar,
    markRead,
    markUnread,
    deleteEmails,
    archiveEmails,
    isSelected,
    toggleSelection,
  } = useEmail()

  if (filteredEmails.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>No emails in this folder</span>
      </div>
    )
  }

  return (
    <div className={styles.list} role="grid" aria-label="Email list">
      {filteredEmails.map((email) => (
        <EmailRow
          key={email.id}
          email={email}
          isSelected={isSelected(email.id)}
          onSelect={(shiftKey) => toggleSelection(email.id, shiftKey)}
          onOpen={() => selectEmail(email.id)}
          onToggleStar={() => toggleStar(email.id)}
          onArchive={() => archiveEmails([email.id])}
          onDelete={() => deleteEmails([email.id])}
          onMarkRead={() =>
            email.isRead ? markUnread([email.id]) : markRead([email.id])
          }
        />
      ))}
    </div>
  )
}
