import { useEmail } from '@/context/EmailContext'
import { useAccounts } from '@/context/AccountContext'
import { EmailRow } from './EmailRow'
import { Icon, type IconName } from '@/components/common/Icon/Icon'
import styles from './EmailList.module.css'

interface EmailListProps {
  onOpenEmail?: (emailId: string) => void
}

const EMPTY_STATES: Record<string, { icon: IconName; title: string; description: string }> = {
  inbox: {
    icon: 'inbox',
    title: 'Your inbox is empty',
    description: 'New emails will appear here',
  },
  starred: {
    icon: 'star',
    title: 'No starred emails',
    description: 'Star emails to find them easily later',
  },
  sent: {
    icon: 'send',
    title: 'No sent emails',
    description: 'Emails you send will appear here',
  },
  drafts: {
    icon: 'edit',
    title: 'No drafts',
    description: 'Emails you save as drafts will appear here',
  },
  trash: {
    icon: 'trash',
    title: 'Trash is empty',
    description: 'Deleted emails will appear here',
  },
  archive: {
    icon: 'archive',
    title: 'No archived emails',
    description: 'Archived emails will appear here',
  },
  spam: {
    icon: 'mail',
    title: 'No spam',
    description: 'Messages marked as spam will appear here',
  },
  default: {
    icon: 'mail',
    title: 'No emails',
    description: 'There are no emails to display',
  },
}

export function EmailList({ onOpenEmail }: EmailListProps) {
  const { selectedFolder } = useAccounts()
  const {
    filteredEmails,
    searchQuery,
    selectEmail,
    toggleStar,
    markRead,
    markUnread,
    deleteEmails,
    archiveEmails,
    isSelected,
    toggleSelection,
    isLoading,
  } = useEmail()

  // Use custom open handler if provided, otherwise use selectEmail
  const handleOpenEmail = onOpenEmail ?? selectEmail

  // Show loading skeleton while loading
  if (isLoading) {
    return (
      <div className={styles.list} role="grid" aria-label="Loading emails">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeleton}>
            <div className={styles.skeletonCheckbox} />
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} style={{ width: '30%' }} />
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredEmails.length === 0) {
    // Show search empty state if searching
    if (searchQuery) {
      return (
        <div className={styles.empty}>
          <Icon name="search" size={48} className={styles.emptyIcon} />
          <span className={styles.emptyTitle}>No results found</span>
          <span className={styles.emptyDescription}>
            No emails match &quot;{searchQuery}&quot;
          </span>
        </div>
      )
    }

    // Show folder-specific empty state
    const emptyState = EMPTY_STATES[selectedFolder] ?? EMPTY_STATES.default
    return (
      <div className={styles.empty}>
        <Icon name={emptyState.icon} size={48} className={styles.emptyIcon} />
        <span className={styles.emptyTitle}>{emptyState.title}</span>
        <span className={styles.emptyDescription}>{emptyState.description}</span>
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
          onOpen={() => handleOpenEmail(email.id)}
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
