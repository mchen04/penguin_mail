import { useEffect, useMemo, useCallback } from 'react'
import { useEmail } from '@/context/EmailContext'
import { useAccounts } from '@/context/AccountContext'
import { useApp } from '@/context/AppContext'
import { useEmailActions } from '@/hooks/useEmailActions'
import { Toolbar } from '@/components/layout/Toolbar/Toolbar'
import { EmailList } from '@/components/email/EmailList/EmailList'
import { EmailView } from '@/components/email/EmailView/EmailView'
import { ContactsPanel } from '@/components/contacts/ContactsPanel'
import type { FolderType } from '@/types/email'
import styles from './MainPanel.module.css'

export function MainPanel() {
  const { currentView, showMail, openDraft } = useApp()
  const { selectedAccountId, selectedFolder } = useAccounts()
  const {
    emails,
    filteredEmails,
    selectedIds,
    selectedEmailId,
    selectEmail,
    clearSelection,
    selectAll,
    setFolder,
    setAccount,
  } = useEmail()

  // Handle opening an email - for drafts, open in compose instead of view
  const handleOpenEmail = useCallback((emailId: string) => {
    const email = emails.find(e => e.id === emailId)
    if (email?.isDraft) {
      openDraft(email)
    } else {
      selectEmail(emailId)
    }
  }, [emails, openDraft, selectEmail])

  // Use enhanced actions with toast notifications
  const {
    deleteEmails,
    deletePermanently,
    emptyTrash,
    emptySpam,
    archiveEmails,
    markRead,
    markUnread,
    toggleStar,
    markAsSpam,
    markNotSpam,
    moveToFolder,
  } = useEmailActions()

  // Determine if we're in the trash folder (for permanent delete)
  const isTrash = selectedFolder === 'trash'

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
      // In trash folder, permanently delete instead of moving to trash
      if (isTrash) {
        deletePermanently(Array.from(selectedIds))
      } else {
        deleteEmails(Array.from(selectedIds))
      }
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

  const handleMarkAsSpam = () => {
    if (selectedCount > 0) {
      markAsSpam(Array.from(selectedIds))
    }
  }

  const handleMarkNotSpam = () => {
    if (selectedCount > 0) {
      markNotSpam(Array.from(selectedIds))
    }
  }

  const handleMoveToFolder = (folder: FolderType) => {
    if (selectedCount > 0) {
      moveToFolder(Array.from(selectedIds), folder)
    }
  }

  // Show contacts view
  if (currentView === 'contacts') {
    return (
      <main className={styles.mainPanel}>
        <div className={styles.content}>
          <ContactsPanel onClose={showMail} />
        </div>
      </main>
    )
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
        currentFolder={selectedFolder}
        onEmptyTrash={emptyTrash}
        onEmptySpam={emptySpam}
        onMarkAsSpam={handleMarkAsSpam}
        onMarkNotSpam={handleMarkNotSpam}
        onMoveToFolder={handleMoveToFolder}
      />

      <div className={styles.content}>
        <EmailList onOpenEmail={handleOpenEmail} />
      </div>
    </main>
  )
}
