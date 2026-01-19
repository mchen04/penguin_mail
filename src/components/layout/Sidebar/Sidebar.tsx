import { useApp } from '@/context/AppContext'
import { useAccounts } from '@/context/AccountContext'
import { AccountSection } from './AccountSection'
import { LabelsSection } from './LabelsSection'
import { CustomFoldersSection } from './CustomFoldersSection'
import { Icon } from '@/components/common/Icon/Icon'
import { ICON_SIZE } from '@/constants'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed, showContacts, currentView } = useApp()
  const { accounts } = useAccounts()

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={styles.overlay}
        data-visible={!sidebarCollapsed}
        onClick={() => setSidebarCollapsed(true)}
        aria-hidden="true"
      />

      <aside className={styles.sidebar} data-collapsed={sidebarCollapsed}>
        {/* Header with hamburger and logo */}
        <div className={styles.header}>
          <button
            className={styles.hamburger}
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className={styles.logo}>
            <svg
              className={styles.logoSvg}
              viewBox="0 0 140 28"
              fill="none"
              aria-label="Penguin Mail"
              role="img"
            >
              {/* Penguin icon */}
              <g transform="translate(0, 2)">
                {/* Body */}
                <ellipse cx="12" cy="14" rx="10" ry="12" fill="currentColor" opacity="0.9" />
                {/* Belly */}
                <ellipse cx="12" cy="16" rx="6" ry="8" fill="var(--color-surface)" />
                {/* Left eye */}
                <circle cx="9" cy="9" r="2" fill="var(--color-surface)" />
                <circle cx="9.5" cy="9" r="1" fill="currentColor" />
                {/* Right eye */}
                <circle cx="15" cy="9" r="2" fill="var(--color-surface)" />
                <circle cx="14.5" cy="9" r="1" fill="currentColor" />
                {/* Beak */}
                <path d="M12 11 L14 13 L12 14 L10 13 Z" fill="var(--color-warning, #f59e0b)" />
                {/* Feet */}
                <ellipse cx="9" cy="25" rx="3" ry="1.5" fill="var(--color-warning, #f59e0b)" />
                <ellipse cx="15" cy="25" rx="3" ry="1.5" fill="var(--color-warning, #f59e0b)" />
              </g>
              {/* "Penguin Mail" text */}
              <text
                x="28"
                y="19"
                fill="currentColor"
                fontFamily="var(--font-family-sans)"
                fontSize="16"
                fontWeight="600"
              >
                Penguin Mail
              </text>
            </svg>
          </div>
        </div>

        {/* Sidebar content - account sections */}
        <nav className={styles.content}>
          {/* "All accounts" section */}
          <AccountSection isAllAccounts />

          {/* Individual account sections */}
          {accounts.map((account) => (
            <AccountSection key={account.id} account={account} />
          ))}

          {/* Custom Folders section */}
          <CustomFoldersSection />

          {/* Labels section */}
          <LabelsSection />
        </nav>

        {/* Footer with Contacts, Add account, and Help */}
        <div className={styles.footer}>
          <button
            className={`${styles.footerButton} ${currentView === 'contacts' ? styles.active : ''}`}
            onClick={showContacts}
          >
            <Icon name="users" size={ICON_SIZE.DEFAULT} />
            Contacts
          </button>
          <button className={styles.footerButton}>
            <Icon name="plus" size={ICON_SIZE.DEFAULT} />
            Add account
          </button>
          <button className={styles.footerButton}>
            <Icon name="help" size={ICON_SIZE.DEFAULT} />
            Help
          </button>
        </div>
      </aside>
    </>
  )
}
