import { lazy, Suspense } from 'react'
import { useApp } from '@/context/AppContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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

export function AppLayout() {
  const { sidebarCollapsed, settingsOpen, closeSettings } = useApp()

  // Global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <div className={styles.layout} data-sidebar-collapsed={sidebarCollapsed}>
      <Sidebar />
      <MainPanel />
      <Suspense fallback={null}>
        <ComposeWindow />
        <SettingsModal isOpen={settingsOpen} onClose={closeSettings} />
      </Suspense>
    </div>
  )
}
