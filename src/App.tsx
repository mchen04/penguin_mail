import { useState } from 'react'
import styles from './App.module.css'

type Theme = 'light' | 'dark'
type Density = 'compact' | 'default' | 'comfortable'

function App() {
  const [theme, setTheme] = useState<Theme>('light')
  const [density, setDensity] = useState<Density>('default')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const changeDensity = (newDensity: Density) => {
    setDensity(newDensity)
    if (newDensity === 'default') {
      document.documentElement.removeAttribute('data-density')
    } else {
      document.documentElement.setAttribute('data-density', newDensity)
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Penguin Mail</h1>
        <p className={styles.subtitle}>Design System Preview</p>
      </header>

      <main className={styles.main}>
        {/* Theme & Density Controls */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Theme & Density</h2>
          <div className={styles.controls}>
            <button className={styles.button} onClick={toggleTheme}>
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </button>
            <div className={styles.densityButtons}>
              <button
                className={`${styles.densityButton} ${density === 'compact' ? styles.active : ''}`}
                onClick={() => changeDensity('compact')}
              >
                Compact
              </button>
              <button
                className={`${styles.densityButton} ${density === 'default' ? styles.active : ''}`}
                onClick={() => changeDensity('default')}
              >
                Default
              </button>
              <button
                className={`${styles.densityButton} ${density === 'comfortable' ? styles.active : ''}`}
                onClick={() => changeDensity('comfortable')}
              >
                Comfortable
              </button>
            </div>
          </div>
        </section>

        {/* Typography Scale */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography Scale (Fluid)</h2>
          <div className={styles.typography}>
            <p className={styles.text2xl}>2XL - Major Headings</p>
            <p className={styles.textXl}>XL - Page Titles</p>
            <p className={styles.textLg}>LG - Section Headers</p>
            <p className={styles.textMd}>MD - Emphasized Text</p>
            <p className={styles.textBase}>Base - Body Text</p>
            <p className={styles.textSm}>SM - Secondary Text</p>
            <p className={styles.textXs}>XS - Timestamps</p>
          </div>
        </section>

        {/* Color Palette */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account Colors</h2>
          <div className={styles.colorGrid}>
            <div className={styles.colorSwatch} style={{ background: 'var(--account-blue)' }}>
              <span>Blue</span>
            </div>
            <div className={styles.colorSwatch} style={{ background: 'var(--account-green)' }}>
              <span>Green</span>
            </div>
            <div className={styles.colorSwatch} style={{ background: 'var(--account-purple)' }}>
              <span>Purple</span>
            </div>
            <div className={styles.colorSwatch} style={{ background: 'var(--account-orange)' }}>
              <span>Orange</span>
            </div>
            <div className={styles.colorSwatch} style={{ background: 'var(--account-pink)' }}>
              <span>Pink</span>
            </div>
            <div className={styles.colorSwatch} style={{ background: 'var(--account-teal)' }}>
              <span>Teal</span>
            </div>
          </div>
        </section>

        {/* Email Row Preview */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Email Row (Density-Aware)</h2>
          <div className={styles.emailList}>
            {[
              { sender: 'John Smith', subject: 'Meeting tomorrow', preview: 'Hey, just wanted to confirm...', color: 'var(--account-blue)', unread: true },
              { sender: 'Amazon', subject: 'Your order shipped', preview: 'Your package is on its way...', color: 'var(--account-green)', unread: false },
              { sender: 'Mom', subject: 'Dinner Sunday?', preview: 'Are you free this weekend for...', color: 'var(--account-purple)', unread: true },
            ].map((email, i) => (
              <div key={i} className={`${styles.emailRow} ${email.unread ? styles.unread : ''}`}>
                <input type="checkbox" className={styles.checkbox} />
                <button className={styles.star}>
                  <svg width="var(--density-icon-size)" height="var(--density-icon-size)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <div className={styles.accountIndicator} style={{ background: email.color }} />
                <span className={styles.sender}>{email.sender}</span>
                <span className={styles.subject}>{email.subject}</span>
                <span className={styles.preview}> - {email.preview}</span>
                <span className={styles.date}>12:34 PM</span>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing Scale */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spacing Scale (4px base)</h2>
          <div className={styles.spacingDemo}>
            {[1, 2, 3, 4, 6, 8, 12].map(n => (
              <div key={n} className={styles.spacingItem}>
                <div
                  className={styles.spacingBox}
                  style={{ width: `var(--space-${n})`, height: `var(--space-${n})` }}
                />
                <span className={styles.spacingLabel}>--space-{n}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Resize the window to see fluid typography in action</p>
      </footer>
    </div>
  )
}

export default App
