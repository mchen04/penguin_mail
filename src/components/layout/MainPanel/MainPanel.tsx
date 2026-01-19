import { useEffect, useMemo } from 'react'
import { useEmail } from '@/context/EmailContext'
import { useAccounts } from '@/context/AccountContext'
import { Toolbar } from '@/components/layout/Toolbar/Toolbar'
import { EmailList } from '@/components/email/EmailList/EmailList'
import { EmailView } from '@/components/email/EmailView/EmailView'
import styles from './MainPanel.module.css'

export function MainPanel() {
  const { selectedAccountId, selectedFolder } = useAccounts()
  const {
    emails,
    filteredEmails,
    selectedIds,
    selectedEmailId,
    selectEmail,
    toggleStar,
    markRead,
    markUnread,
    deleteEmails,
    archiveEmails,
    clearSelection,
    selectAll,
    setFolder,
    setAccount,
  } = useEmail()

  // Sync folder/account selection from AccountContext to EmailContext
  useEffect(() => {
    setFolder(selectedFolder)
    setAccount(selectedAccountId ?? 'all')
  }, [selectedAccountId, selectedFolder, setFolder, setAccount])

  const selectedCount = selectedIds.size
  const totalCount = filteredEmails.length
  const allSelected = totalCount > 0 && selectedCount === totalCount

  // Look up selected email from state, not static mock data
  const selectedEmail = useMemo(
    () => (selectedEmailId ? emails.find((e) => e.id === selectedEmailId) ?? null : null),
    [selectedEmailId, emails]
  )

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      selectAll()
    } else {
      clearSelection()
    }
  }

  const handleArchive = () => {
    if (selectedCount > 0) {
      archiveEmails(Array.from(selectedIds))
    }
  }

  const handleDelete = () => {
    if (selectedCount > 0) {
      deleteEmails(Array.from(selectedIds))
    }
  }

  const handleMarkRead = () => {
    if (selectedCount > 0) {
      const hasUnread = filteredEmails.some(e => selectedIds.has(e.id) && !e.isRead)
      if (hasUnread) {
        markRead(Array.from(selectedIds))
      } else {
        markUnread(Array.from(selectedIds))
      }
    }
  }

  // Show email view if an email is selected
  if (selectedEmail) {
    return (
      <main className={styles.mainPanel}>
        <div className={styles.content}>
          <EmailView
            email={selectedEmail}
            onBack={() => selectEmail(null)}
            onToggleStar={() => toggleStar(selectedEmail.id)}
            onArchive={() => {
              archiveEmails([selectedEmail.id])
              selectEmail(null)
            }}
            onDelete={() => {
              deleteEmails([selectedEmail.id])
              selectEmail(null)
            }}
          />
        </div>
      </main>
    )
  }

  // Show email list
  return (
    <main className={styles.mainPanel}>
      <Toolbar
        selectedCount={selectedCount}
        totalCount={totalCount}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onMarkRead={handleMarkRead}
      />

      <div className={styles.content}>
        <EmailList />
      </div>
    </main>
  )
}
