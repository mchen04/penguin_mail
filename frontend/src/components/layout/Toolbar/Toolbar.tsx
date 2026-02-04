import { useState, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { useEmail, type SearchFilters } from '@/context/EmailContext'
import { Button } from '@/components/common/Button/Button'
import { IconButton } from '@/components/common/IconButton/IconButton'
import { Checkbox } from '@/components/common/Checkbox/Checkbox'
import { Icon } from '@/components/common/Icon/Icon'
import { ICON_SIZE } from '@/constants'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { AdvancedSearch } from './AdvancedSearch'
import { BulkActions } from './BulkActions'
import type { FolderType } from '@/types/email'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  selectedCount?: number
  totalCount?: number
  onSelectAll?: (selected: boolean) => void
  allSelected?: boolean
  onArchive?: () => void
  onDelete?: () => void
  onMarkRead?: () => void
  currentFolder?: FolderType
  onEmptyTrash?: () => void
  onEmptySpam?: () => void
  onMarkAsSpam?: () => void
  onMarkNotSpam?: () => void
  onMoveToFolder?: (folder: FolderType) => void
  onSnooze?: (snoozeUntil: Date) => void
}

export function Toolbar({
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  allSelected = false,
  onArchive,
  onDelete,
  onMarkRead,
  currentFolder = 'inbox',
  onEmptyTrash,
  onEmptySpam,
  onMarkAsSpam,
  onMarkNotSpam,
  onMoveToFolder,
  onSnooze,
}: ToolbarProps) {
  const { setSidebarCollapsed, openCompose, openSettings } = useApp()
  const { searchFilters, setSearchFilters } = useEmail()

  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false)
  const [showEmptySpamConfirm, setShowEmptySpamConfirm] = useState(false)

  const handleSearch = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters)
  }, [setSearchFilters])

  const hasSelection = selectedCount > 0
  const isTrash = currentFolder === 'trash'
  const isSpam = currentFolder === 'spam'
  const isSnoozed = currentFolder === 'snoozed'

  const handleEmptyTrash = () => {
    onEmptyTrash?.()
    setShowEmptyTrashConfirm(false)
  }

  const handleEmptySpam = () => {
    onEmptySpam?.()
    setShowEmptySpamConfirm(false)
  }

  return (
    <div className={styles.toolbar}>
      {/* Left section */}
      <div className={styles.leftSection}>
        {/* Mobile hamburger */}
        <IconButton
          icon="hamburger"
          label="Open sidebar"
          onClick={() => setSidebarCollapsed(false)}
          className={styles.mobileHamburger}
        />

        {/* Compose button */}
        <Button variant="primary" onClick={() => openCompose()}>
          <Icon name="plus" size={ICON_SIZE.DEFAULT} />
          <span className={styles.composeText}>Compose</span>
        </Button>
      </div>

      {/* Center section - Advanced Search */}
      <div className={styles.centerSection}>
        <AdvancedSearch onSearch={handleSearch} initialFilters={searchFilters} />
      </div>

      {/* Right section */}
      <div className={styles.rightSection}>
        {/* Select all checkbox */}
        <div className={styles.selectAll}>
          <Checkbox
            checked={allSelected}
            onChange={(e) => onSelectAll?.(e.target.checked)}
            label="Select all"
            disabled={totalCount === 0}
          />
        </div>

        <span className={styles.divider} />

        {/* Bulk actions */}
        <div className={styles.hideMobile}>
          <BulkActions
            hasSelection={hasSelection}
            onArchive={onArchive}
            onDelete={onDelete}
            onMarkRead={onMarkRead}
            isTrash={isTrash}
            isSpam={isSpam}
            isSnoozed={isSnoozed}
            onMarkAsSpam={onMarkAsSpam}
            onMarkNotSpam={onMarkNotSpam}
            onMoveToFolder={onMoveToFolder}
            onSnooze={onSnooze}
          />
        </div>

        {/* Folder-specific actions */}
        {isTrash && totalCount > 0 && (
          <>
            <span className={styles.divider} />
            <Button variant="secondary" onClick={() => setShowEmptyTrashConfirm(true)}>
              <Icon name="trash" size={ICON_SIZE.SMALL} />
              <span className={styles.hideMobile}>Empty Trash</span>
            </Button>
          </>
        )}
        {isSpam && totalCount > 0 && (
          <>
            <span className={styles.divider} />
            <Button variant="secondary" onClick={() => setShowEmptySpamConfirm(true)}>
              <Icon name="trash" size={ICON_SIZE.SMALL} />
              <span className={styles.hideMobile}>Empty Spam</span>
            </Button>
          </>
        )}

        <span className={styles.divider} />

        {/* Settings */}
        <IconButton
          icon="settings"
          label="Settings"
          onClick={() => openSettings()}
        />
      </div>

      {/* Confirmation dialogs */}
      <ConfirmDialog
        isOpen={showEmptyTrashConfirm}
        onClose={() => setShowEmptyTrashConfirm(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Trash"
        message={`Are you sure you want to permanently delete all ${totalCount} email${totalCount !== 1 ? 's' : ''} in the trash? This action cannot be undone.`}
        confirmLabel="Empty Trash"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showEmptySpamConfirm}
        onClose={() => setShowEmptySpamConfirm(false)}
        onConfirm={handleEmptySpam}
        title="Empty Spam"
        message={`Are you sure you want to permanently delete all ${totalCount} email${totalCount !== 1 ? 's' : ''} in spam? This action cannot be undone.`}
        confirmLabel="Empty Spam"
        variant="danger"
      />
    </div>
  )
}
