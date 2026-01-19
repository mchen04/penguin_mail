import { useApp } from '@/context/AppContext'
import { useEmail } from '@/context/EmailContext'
import { Button } from '@/components/common/Button/Button'
import { IconButton } from '@/components/common/IconButton/IconButton'
import { Checkbox } from '@/components/common/Checkbox/Checkbox'
import { Icon } from '@/components/common/Icon/Icon'
import { SearchBar } from './SearchBar'
import { BulkActions } from './BulkActions'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  selectedCount?: number
  totalCount?: number
  onSelectAll?: (selected: boolean) => void
  allSelected?: boolean
  onArchive?: () => void
  onDelete?: () => void
  onMarkRead?: () => void
}

export function Toolbar({
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  allSelected = false,
  onArchive,
  onDelete,
  onMarkRead,
}: ToolbarProps) {
  const { setSidebarCollapsed, openCompose, openSettings } = useApp()
  const { searchQuery, setSearch } = useEmail()

  const hasSelection = selectedCount > 0

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
        <Button variant="primary" onClick={openCompose}>
          <Icon name="plus" size={18} />
          <span className={styles.composeText}>Compose</span>
        </Button>
      </div>

      {/* Center section - Search */}
      <div className={styles.centerSection}>
        <SearchBar value={searchQuery} onChange={setSearch} />
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
          />
        </div>

        <span className={styles.divider} />

        {/* Settings */}
        <IconButton
          icon="settings"
          label="Settings"
          onClick={() => openSettings()}
        />
      </div>
    </div>
  )
}
