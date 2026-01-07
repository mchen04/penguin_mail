import { useEmail } from '@/context/EmailContext'
import { useSelection } from '@/hooks/useSelection'
import { EmailRow } from './EmailRow'
import styles from './EmailList.module.css'
import { useEffect } from 'react'

export function EmailList() {
  const {
    filteredEmails,
    selectEmail,
    toggleStar,
    markRead,
    markUnread,
    deleteEmails,
    archiveEmails,
    setSelection,
  } = useEmail()

  const {
    selectedIds,
    isSelected,
    toggle,
  } = useSelection({
    items: filteredEmails,
    getItemId: (email) => email.id,
  })

  // Sync selection state with context
  useEffect(() => {
    setSelection(selectedIds)
  }, [selectedIds, setSelection])

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
          onSelect={(shiftKey) => toggle(email.id, shiftKey)}
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
