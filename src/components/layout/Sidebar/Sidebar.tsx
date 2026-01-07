import { useApp } from '@/context/AppContext'
import { useAccounts } from '@/context/AccountContext'
import { AccountSection } from './AccountSection'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useApp()
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
          <span className={styles.logo}>Penguin Mail</span>
        </div>

        {/* Sidebar content - account sections */}
        <nav className={styles.content}>
          {/* "All accounts" section */}
          <AccountSection isAllAccounts />

          {/* Individual account sections */}
          {accounts.map((account) => (
            <AccountSection key={account.id} account={account} />
          ))}
        </nav>

        {/* Footer with Add account and Help */}
        <div className={styles.footer}>
          <button className={styles.footerButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add account
          </button>
          <button className={styles.footerButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
            Help
          </button>
        </div>
      </aside>
    </>
  )
}
