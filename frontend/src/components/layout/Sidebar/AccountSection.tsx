import { memo } from 'react'
import { useAccounts } from '@/context/AccountContext'
import { useEmail } from '@/context/EmailContext'
import { FolderItem } from './FolderItem'
import { ACCOUNT_COLOR_VAR, type Account } from '@/types/account'
import type { SystemFolderType } from '@/types/email'
import { STANDARD_FOLDERS, ALL_ACCOUNTS_ID, LABELS } from '@/constants'
import styles from './AccountSection.module.css'

interface AccountSectionProps {
  account?: Account // undefined = "All accounts"
  isAllAccounts?: boolean
}

export const AccountSection = memo(function AccountSection({ account, isAllAccounts = false }: AccountSectionProps) {
  const {
    expandedAccountIds,
    toggleAccountExpanded,
    selectedAccountId,
    selectedFolder,
    selectFolder,
  } = useAccounts()

  const { getUnreadCount, getTotalUnreadCount } = useEmail()

  const sectionId = isAllAccounts ? ALL_ACCOUNTS_ID : account?.id
  const isExpanded = sectionId ? expandedAccountIds.has(sectionId) : false
  const accountId = isAllAccounts ? null : account?.id ?? null

  const handleHeaderClick = () => {
    if (sectionId) {
      toggleAccountExpanded(sectionId)
    }
  }

  const handleFolderClick = (folder: SystemFolderType) => {
    selectFolder(accountId, folder)
  }

  const isSelected = (folder: SystemFolderType) =>
    selectedAccountId === accountId && selectedFolder === folder

  // Get unread count for inbox, 0 for other folders (to show badge only for unread)
  const getCount = (folder: SystemFolderType): number => {
    if (folder !== 'inbox') return 0
    if (isAllAccounts) {
      return getTotalUnreadCount()
    }
    return getUnreadCount('inbox', account?.id)
  }

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header} onClick={handleHeaderClick}>
        {/* Chevron */}
        <span className={styles.chevron} data-expanded={isExpanded}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>

        {/* Indicator - color dot for accounts, stacked icon for "All accounts" */}
        {isAllAccounts ? (
          <span className={styles.allAccountsIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5" />
              <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
            </svg>
          </span>
        ) : account && (
          <span
            className={styles.colorIndicator}
            style={{ background: ACCOUNT_COLOR_VAR[account.color] }}
            role="img"
            aria-label={`${account.color} account indicator`}
          />
        )}

        {/* Account name/email */}
        <span className={styles.accountName}>
          {isAllAccounts ? LABELS.ALL_ACCOUNTS : account?.email}
        </span>
      </div>

      {/* Folder list */}
      <div className={styles.folders} data-expanded={isExpanded}>
        {isAllAccounts ? (
          // "All accounts" only shows Inbox
          <FolderItem
            folder="inbox"
            count={getCount('inbox')}
            isSelected={isSelected('inbox')}
            onClick={() => handleFolderClick('inbox')}
          />
        ) : (
          // Individual accounts show all folders
          STANDARD_FOLDERS.map((folder) => (
            <FolderItem
              key={folder}
              folder={folder}
              count={getCount(folder)}
              isSelected={isSelected(folder)}
              onClick={() => handleFolderClick(folder)}
            />
          ))
        )}
      </div>
    </div>
  )
})
