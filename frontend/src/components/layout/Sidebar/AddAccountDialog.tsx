import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/common/Icon/Icon'
import { Button } from '@/components/common/Button/Button'
import { ICON_SIZE } from '@/constants'
import type { AccountColor } from '@/types/account'
import styles from './AddAccountDialog.module.css'

interface AddAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    email: string;
    name: string;
    color: AccountColor;

    smtp_url: string;
    smtp_password: string;
    imap_url: string;
    imap_password: string
  }) => Promise<void>
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
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState<AccountColor>('blue')
  const [smtp_url, setSmtpUrl] = useState('')
  const [smtp_password, setSmtpPassword] = useState('')
  const [imap_url, setImapUrl] = useState('')
  const [imap_password, setImapPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      setSmtpUrl('')
      setSmtpPassword('')
      setImapUrl('')
      setImapPassword('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!email.trim() || !name.trim()) {
      setError('Email and account name are required.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({
        email: email.trim(), name: name.trim(), color,
        smtp_url,
        smtp_password,
        imap_url,
        imap_password
      })
      onClose()
    } catch (e) {
      setError((e as Error).message || 'Failed to add account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

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
              onChange={(e) => setEmail(e.target.value)}
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

          <div className={styles.field}>
            <label htmlFor="account-smtp-url">SMTP server URL for this account</label>
            <input
              id="account-smtp-url"
              type="text"
              value={smtp_url}
              onChange={(e) => setSmtpUrl(e.target.value)}
              placeholder="e.g. smtp.gmail.com"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="account-smtp-password">SMTP password for this account</label>
            <input
              id="account-smtp-password"
              type="text"
              value={smtp_password}
              onChange={(e) => setSmtpPassword(e.target.value)}
              placeholder="Personal, Work, etc."
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="account-imap-url">IMAP server URL for this account</label>
            <input
              id="account-imap-url"
              type="text"
              value={imap_url}
              onChange={(e) => setImapUrl(e.target.value)}
              placeholder="e.g. imap.gmail.com"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="account-imap-password">IMAP password for this account</label>
            <input
              id="account-smtp-password"
              type="text"
              value={imap_password}
              onChange={(e) => setImapPassword(e.target.value)}
              placeholder="Personal, Work, etc."
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !email.trim() || !name.trim()}
          >
            {isSubmitting ? 'Adding...' : 'Add Account'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
