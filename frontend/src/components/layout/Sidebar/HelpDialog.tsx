import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/common/Icon/Icon'
import { Button } from '@/components/common/Button/Button'
import { ICON_SIZE } from '@/constants'
import styles from './HelpDialog.module.css'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { keys: 'C', action: 'Compose new email' },
  { keys: 'R', action: 'Reply' },
  { keys: 'A', action: 'Reply all' },
  { keys: 'F', action: 'Forward' },
  { keys: 'E', action: 'Archive' },
  { keys: '#', action: 'Delete' },
  { keys: 'S', action: 'Star / Unstar' },
  { keys: '/', action: 'Search' },
  { keys: 'Esc', action: 'Close / Go back' },
]

export function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-dialog-title"
      >
        <div className={styles.header}>
          <h2 id="help-dialog-title" className={styles.title}>
            <Icon name="help" size={ICON_SIZE.LARGE} />
            Help
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <Icon name="close" size={ICON_SIZE.DEFAULT} />
          </button>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Getting Started</h3>
            <ul className={styles.tipList}>
              <li>Add an email account using the <strong>Add account</strong> button in the sidebar to start sending and receiving emails.</li>
              <li>Use <strong>Labels</strong> and <strong>Folders</strong> in the sidebar to organize your mail.</li>
              <li>Click <strong>Contacts</strong> in the sidebar to manage your address book.</li>
              <li>Open <strong>Settings</strong> via the gear icon to customize your experience.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Keyboard Shortcuts</h3>
            <div className={styles.shortcutGrid}>
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className={styles.shortcutRow}>
                  <kbd className={styles.kbd}>{s.keys}</kbd>
                  <span className={styles.shortcutAction}>{s.action}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Tips</h3>
            <ul className={styles.tipList}>
              <li>Use the search bar to find emails quickly by sender, subject, or content.</li>
              <li>Star important emails for quick access from the Starred folder.</li>
              <li>Create contact groups to easily email teams of people.</li>
            </ul>
          </section>
        </div>

        <div className={styles.footer}>
          <Button variant="primary" onClick={onClose}>Got it</Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
