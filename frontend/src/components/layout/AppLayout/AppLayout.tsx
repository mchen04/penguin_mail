import { lazy, Suspense, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Sidebar } from '@/components/layout/Sidebar/Sidebar'
import { MainPanel } from '@/components/layout/MainPanel/MainPanel'
import styles from './AppLayout.module.css'

// Lazy load components that aren't immediately visible
const ComposeWindow = lazy(() =>
  import('@/components/email/Compose/ComposeWindow').then((m) => ({ default: m.ComposeWindow }))
)
const SettingsModal = lazy(() =>
  import('@/components/settings/SettingsModal/SettingsModal').then((m) => ({ default: m.SettingsModal }))
)

function SkipToContent() {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView()
    }
  }, [])

  return (
    <a href="#main-content" className={styles.skipLink} onClick={handleClick}>
      Skip to main content
    </a>
  )
}

export function AppLayout() {
  const { sidebarCollapsed, settingsOpen, closeSettings } = useApp()

  // Global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <>
      <SkipToContent />
      <div className={styles.layout} data-sidebar-collapsed={sidebarCollapsed}>
        <ErrorBoundary inline section="Sidebar">
          <Sidebar />
        </ErrorBoundary>
        <ErrorBoundary inline section="Email">
          <MainPanel />
        </ErrorBoundary>
        <Suspense fallback={null}>
          <ErrorBoundary inline section="Compose">
            <ComposeWindow />
          </ErrorBoundary>
          <ErrorBoundary inline section="Settings">
            <SettingsModal isOpen={settingsOpen} onClose={closeSettings} />
          </ErrorBoundary>
        </Suspense>
      </div>
    </>
  )
}
