import { useApp } from '@/context/AppContext'
import { Modal } from '@/components/common/Modal/Modal'
import styles from './SettingsModal.module.css'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme, density, setDensity } = useApp()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="medium">
      <div className={styles.settings}>
        {/* Theme Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Appearance</h3>

          <div className={styles.setting}>
            <label className={styles.label}>Theme</label>
            <div className={styles.options}>
              <button
                type="button"
                className={`${styles.option} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => setTheme('light')}
              >
                <span className={styles.optionIcon}>☀️</span>
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`${styles.option} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => setTheme('dark')}
              >
                <span className={styles.optionIcon}>🌙</span>
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div className={styles.setting}>
            <label className={styles.label}>Display Density</label>
            <div className={styles.options}>
              <button
                type="button"
                className={`${styles.option} ${density === 'compact' ? styles.active : ''}`}
                onClick={() => setDensity('compact')}
              >
                Compact
              </button>
              <button
                type="button"
                className={`${styles.option} ${density === 'default' ? styles.active : ''}`}
                onClick={() => setDensity('default')}
              >
                Default
              </button>
              <button
                type="button"
                className={`${styles.option} ${density === 'comfortable' ? styles.active : ''}`}
                onClick={() => setDensity('comfortable')}
              >
                Comfortable
              </button>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Accounts</h3>
          <p className={styles.placeholder}>
            Account settings will be available in a future update.
          </p>
        </section>

        {/* Signature Section */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Signature</h3>
          <p className={styles.placeholder}>
            Email signature settings will be available in a future update.
          </p>
        </section>
      </div>
    </Modal>
  )
}
