import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/common/Icon/Icon'
import { Button } from '@/components/common/Button/Button'
import { ICON_SIZE } from '@/constants'
import type { AccountColor } from '@/types/account'
import type { EmailProvider } from '@/constants/providers'
import { PROVIDER_OPTIONS, DOMAIN_TO_PROVIDER } from '@/constants/providers'
import { useRepositories } from '@/context/RepositoryContext'
import styles from './AddAccountDialog.module.css'

interface AddAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    email: string
    name: string
    color: AccountColor
    provider: EmailProvider
    password: string
    smtp_host?: string
    smtp_port?: number
    smtp_security?: string
    imap_host?: string
    imap_port?: number
    imap_security?: string
  }) => Promise<void>
}

const APP_PASSWORD_HINTS: Partial<Record<EmailProvider, { text: string; url: string }>> = {
  gmail: {
    text: 'Gmail requires an App Password if you have 2-Step Verification enabled.',
    url: 'https://myaccount.google.com/apppasswords',
  },
  yahoo: {
    text: 'Yahoo requires an App Password for third-party mail clients.',
    url: 'https://login.yahoo.com/account/security',
  },
  icloud: {
    text: 'iCloud requires an App-Specific Password for third-party mail clients.',
    url: 'https://appleid.apple.com/account/manage',
  },
}

const ACCOUNT_COLORS: { value: AccountColor; label: string; hex: string }[] = [
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'green', label: 'Green', hex: '#22c55e' },
  { value: 'purple', label: 'Purple', hex: '#8b5cf6' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
  { value: 'teal', label: 'Teal', hex: '#14b8a6' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
]

export function AddAccountDialog({ isOpen, onClose, onSubmit }: AddAccountDialogProps) {
  const { accounts: accountRepository } = useRepositories()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState<AccountColor>('blue')
  const [provider, setProvider] = useState<EmailProvider>('gmail')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Custom server fields
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpSecurity, setSmtpSecurity] = useState('starttls')
  const [imapHost, setImapHost] = useState('')
  const [imapPort, setImapPort] = useState('993')
  const [imapSecurity, setImapSecurity] = useState('ssl')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Test connection state
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ smtp: boolean; imap: boolean; smtp_error: string; imap_error: string } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isSubmitting])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setName('')
      setColor('blue')
      setProvider('gmail')
      setPassword('')
      setShowPassword(false)
      setSmtpHost('')
      setSmtpPort('587')
      setSmtpSecurity('starttls')
      setImapHost('')
      setImapPort('993')
      setImapSecurity('ssl')
      setError(null)
      setTestResult(null)
    }
  }, [isOpen])

  // Auto-detect provider from email domain
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value)
    const atIndex = value.indexOf('@')
    if (atIndex !== -1) {
      const domain = value.slice(atIndex + 1).toLowerCase()
      const detected = DOMAIN_TO_PROVIDER[domain]
      if (detected) {
        setProvider(detected)
      }
    }
  }, [])

  const handleTestConnection = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and app password are required to test connection.')
      return
    }
    setIsTesting(true)
    setTestResult(null)
    setError(null)

    const input: Record<string, unknown> = {
      email: email.trim(),
      provider,
      password,
    }
    if (provider === 'custom') {
      input.smtp_host = smtpHost
      input.smtp_port = parseInt(smtpPort) || 587
      input.smtp_security = smtpSecurity
      input.imap_host = imapHost
      input.imap_port = parseInt(imapPort) || 993
      input.imap_security = imapSecurity
    }

    const result = await accountRepository.testConnection(input as Parameters<typeof accountRepository.testConnection>[0])
    setIsTesting(false)
    if (result.success) {
      setTestResult(result.data)
      if (!result.data.smtp || !result.data.imap) {
        const hint = APP_PASSWORD_HINTS[provider]
        const authFailed = result.data.smtp_error?.toLowerCase().includes('auth') ||
          result.data.imap_error?.toLowerCase().includes('auth') ||
          result.data.smtp_error?.toLowerCase().includes('credential') ||
          result.data.imap_error?.toLowerCase().includes('credential')
        const errors: string[] = []
        if (!result.data.smtp) errors.push(`SMTP: ${result.data.smtp_error}`)
        if (!result.data.imap) errors.push(`IMAP: ${result.data.imap_error}`)
        if (authFailed && hint) {
          errors.push(`Authentication failed. Use an App Password instead of your regular password.`)
        }
        setError(errors.join('\n'))
      }
    } else {
      setError(result.error ?? 'Connection test failed')
    }
  }

  const handleSubmit = async () => {
    if (!email.trim() || !name.trim()) {
      setError('Email and account name are required.')
      return
    }
    if (!password.trim()) {
      setError('App password is required.')
      return
    }
    if (provider === 'custom' && (!smtpHost.trim() || !imapHost.trim())) {
      setError('SMTP and IMAP hosts are required for custom provider.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({
        email: email.trim(),
        name: name.trim(),
        color,
        provider,
        password,
        ...(provider === 'custom' ? {
          smtp_host: smtpHost,
          smtp_port: parseInt(smtpPort) || 587,
          smtp_security: smtpSecurity,
          imap_host: imapHost,
          imap_port: parseInt(imapPort) || 993,
          imap_security: imapSecurity,
        } : {}),
      })
      onClose()
    } catch (e) {
      setError((e as Error).message || 'Failed to add account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isCustom = provider === 'custom'

  return createPortal(
    <div
      className={styles.overlay}
      onClick={isSubmitting ? undefined : onClose}
      role="presentation"
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-account-title"
      >
        <div className={styles.header}>
          <h2 id="add-account-title" className={styles.title}>Add Email Account</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            <Icon name="close" size={ICON_SIZE.DEFAULT} />
          </button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="account-email">Email address</label>
            <input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="account-name">Account name</label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Personal, Work, etc."
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="account-provider">Email provider</label>
            <select
              id="account-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as EmailProvider)}
              disabled={isSubmitting}
              className={styles.select}
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="account-password">App password</label>
            <div className={styles.passwordField}>
              <input
                id="account-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your app password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {APP_PASSWORD_HINTS[provider] && (
              <p className={styles.fieldHint}>
                {APP_PASSWORD_HINTS[provider]!.text}{' '}
                <a href={APP_PASSWORD_HINTS[provider]!.url} target="_blank" rel="noopener noreferrer">
                  How to create one →
                </a>
              </p>
            )}
          </div>

          {isCustom && (
            <>
              <div className={styles.sectionLabel}>SMTP Settings</div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="account-smtp-host">SMTP host</label>
                  <input
                    id="account-smtp-host"
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.example.com"
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.fieldSmall}>
                  <label htmlFor="account-smtp-port">Port</label>
                  <input
                    id="account-smtp-port"
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.fieldSmall}>
                  <label htmlFor="account-smtp-security">Security</label>
                  <select
                    id="account-smtp-security"
                    value={smtpSecurity}
                    onChange={(e) => setSmtpSecurity(e.target.value)}
                    disabled={isSubmitting}
                    className={styles.select}
                  >
                    <option value="starttls">STARTTLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
              </div>

              <div className={styles.sectionLabel}>IMAP Settings</div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="account-imap-host">IMAP host</label>
                  <input
                    id="account-imap-host"
                    type="text"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    placeholder="imap.example.com"
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.fieldSmall}>
                  <label htmlFor="account-imap-port">Port</label>
                  <input
                    id="account-imap-port"
                    type="number"
                    value={imapPort}
                    onChange={(e) => setImapPort(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.fieldSmall}>
                  <label htmlFor="account-imap-security">Security</label>
                  <select
                    id="account-imap-security"
                    value={imapSecurity}
                    onChange={(e) => setImapSecurity(e.target.value)}
                    disabled={isSubmitting}
                    className={styles.select}
                  >
                    <option value="ssl">SSL</option>
                    <option value="starttls">STARTTLS</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className={styles.field}>
            <label>Account color</label>
            <div className={styles.colorPicker}>
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={styles.colorOption}
                  style={{ backgroundColor: c.hex }}
                  data-selected={c.value === color}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          {/* Test connection result */}
          {testResult && testResult.smtp && testResult.imap && (
            <div className={styles.success}>Connection successful</div>
          )}
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleTestConnection} disabled={isSubmitting || isTesting}>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
          <div className={styles.footerRight}>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !email.trim() || !name.trim() || !password.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
