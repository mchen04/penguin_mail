import { memo } from 'react'
import { useAccounts } from '@/context/AccountContext'
import { FolderItem } from './FolderItem'
import { ACCOUNT_COLOR_VAR, type Account, type FolderType } from '@/types/account'
import styles from './AccountSection.module.css'

interface AccountSectionProps {
  account?: Account // undefined = "All accounts"
  isAllAccounts?: boolean
}

const FOLDERS: FolderType[] = ['inbox', 'drafts', 'sent', 'spam', 'trash']

export const AccountSection = memo(function AccountSection({ account, isAllAccounts = false }: AccountSectionProps) {
  const {
    expandedAccountIds,
    toggleAccountExpanded,
    selectedAccountId,
    selectedFolder,
    selectFolder,
    getTotalUnread,
  } = useAccounts()

  const isExpanded = isAllAccounts ? true : (account && expandedAccountIds.has(account.id))
  const accountId = isAllAccounts ? null : account?.id ?? null

  const handleHeaderClick = () => {
    if (!isAllAccounts && account) {
      toggleAccountExpanded(account.id)
    }
  }

  const handleFolderClick = (folder: FolderType) => {
    selectFolder(accountId, folder)
  }

  const isSelected = (folder: FolderType) =>
    selectedAccountId === accountId && selectedFolder === folder

  const getCount = (folder: FolderType): number => {
    if (isAllAccounts) {
      // For "All accounts", sum up inbox counts only
      return folder === 'inbox' ? getTotalUnread() : 0
    }
    return account?.folderCounts[folder] ?? 0
  }

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.header} onClick={handleHeaderClick}>
        {/* Chevron - only show for individual accounts */}
        {!isAllAccounts && (
          <span className={styles.chevron} data-expanded={isExpanded}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        )}

        {/* Color indicator - only for individual accounts */}
        {!isAllAccounts && account && (
          <span
            className={styles.colorIndicator}
            style={{ background: ACCOUNT_COLOR_VAR[account.color] }}
            role="img"
            aria-label={`${account.color} account indicator`}
          />
        )}

        {/* Account name/email */}
        <span className={`${styles.accountName} ${isAllAccounts ? styles.allAccountsLabel : ''}`}>
          {isAllAccounts ? 'All accounts' : account?.email}
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
          FOLDERS.map((folder) => (
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
