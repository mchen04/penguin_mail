import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Rnd } from 'react-rnd'
import { useApp } from '@/context/AppContext'
import { useAccounts } from '@/context/AccountContext'
import { useEmail } from '@/context/EmailContext'
import { useSettings } from '@/context/SettingsContext'
import { useComposeWindowState } from '@/hooks/useComposeWindowState'
import { Button } from '@/components/common/Button/Button'
import { Icon } from '@/components/common/Icon/Icon'
import { ComposeHeader, DRAG_HANDLE_CLASS } from './ComposeHeader'
import { RecipientField } from './RecipientField'
import { RichTextToolbar } from './RichTextToolbar'
import { PLACEHOLDERS, COMPOSE_WINDOW } from '@/constants'
import { cn } from '@/utils/cn'
import type { EmailAddress } from '@/types/email'
import styles from './ComposeWindow.module.css'

// Convert EmailAddress to display string
function formatRecipient(addr: EmailAddress): string {
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email
}

export function ComposeWindow() {
  const { composeState, composeData, closeCompose, minimizeCompose, maximizeCompose, openCompose } = useApp()
  const { accounts } = useAccounts()
  const { sendEmail, saveDraft, deleteEmails } = useEmail()
  const { signatures } = useSettings()
  const { size, position, setSize, setPosition } = useComposeWindowState()

  // Get the default signature (or first signature if none is default)
  const defaultSignature = useMemo(() => {
    const sig = signatures.find(s => s.isDefault) ?? signatures[0]
    return sig?.content ?? ''
  }, [signatures])

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? '')
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState<string[]>([])
  const [bcc, setBcc] = useState<string[]>([])
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [draftId, setDraftId] = useState<string | undefined>(undefined)
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined)
  const [forwardedFromId, setForwardedFromId] = useState<string | undefined>(undefined)

  // Track if we've initialized from composeData
  const lastComposeDataRef = useRef<typeof composeData>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize form from composeData when it changes
  useEffect(() => {
    if (composeData && composeData !== lastComposeDataRef.current) {
      lastComposeDataRef.current = composeData

      // Pre-populate recipients
      if (composeData.to) {
        setTo(composeData.to.map(formatRecipient))
      } else {
        setTo([])
      }

      if (composeData.cc) {
        setCc(composeData.cc.map(formatRecipient))
        setShowCc(true)
      } else {
        setCc([])
        setShowCc(false)
      }

      // Pre-populate subject and body
      setSubject(composeData.subject ?? '')

      // For new emails, add signature; for replies/forwards, the body already has quoted text
      const initialBody = composeData.mode === 'new' && defaultSignature
        ? `<br><br>--<br>${defaultSignature}`
        : (composeData.body ?? '')
      setBody(initialBody)
      // Also set the editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = initialBody
      }

      // Set IDs for reply/forward tracking
      setDraftId(composeData.draftId)
      setReplyToId(composeData.replyToId)
      setForwardedFromId(composeData.forwardedFromId)

      // Set account from original email if available
      if (composeData.originalEmail?.accountId) {
        setFromAccountId(composeData.originalEmail.accountId)
      }
    }
  }, [composeData, defaultSignature])

  const resetForm = useCallback(() => {
    setFromAccountId(accounts[0]?.id ?? '')
    setTo([])
    setCc([])
    setBcc([])
    setShowCc(false)
    setShowBcc(false)
    setSubject('')
    setBody('')
    setIsSending(false)
    setDraftId(undefined)
    setReplyToId(undefined)
    setForwardedFromId(undefined)
    lastComposeDataRef.current = null
  }, [accounts])

  if (composeState === 'closed') return null

  const selectedAccount = accounts.find((a) => a.id === fromAccountId) ?? accounts[0]

  const handleMinimize = () => {
    if (composeState === 'minimized') {
      openCompose()
    } else {
      minimizeCompose()
    }
  }

  const handleMaximize = () => {
    if (composeState === 'maximized') {
      openCompose()
    } else {
      maximizeCompose()
    }
  }

  const handleClose = () => {
    // Auto-save as draft if there's content
    if (to.length > 0 || subject || body) {
      handleSaveDraft()
    }
    resetForm()
    closeCompose()
  }

  const parseRecipients = (recipients: string[]): EmailAddress[] => {
    return recipients.map((r) => {
      // Simple parsing - in a real app, you'd want more robust parsing
      const emailMatch = r.match(/<(.+)>/)
      if (emailMatch) {
        const name = r.replace(/<.+>/, '').trim()
        return { name, email: emailMatch[1] }
      }
      return { name: r.split('@')[0], email: r }
    })
  }

  const handleSend = async () => {
    if (to.length === 0) return

    setIsSending(true)
    try {
      await sendEmail({
        id: draftId, // Include draft ID if editing a draft
        accountId: fromAccountId,
        accountColor: selectedAccount?.color as 'blue' | 'green' | 'purple' | 'orange' | 'red',
        from: {
          name: selectedAccount?.name ?? 'You',
          email: selectedAccount?.email ?? '',
        },
        to: parseRecipients(to),
        cc: showCc && cc.length > 0 ? parseRecipients(cc) : undefined,
        bcc: showBcc && bcc.length > 0 ? parseRecipients(bcc) : undefined,
        subject,
        body,
        replyToId,
        forwardedFromId,
        isDraft: !!draftId,
      })
      resetForm()
      closeCompose()
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    if (to.length === 0 && !subject && !body) return

    await saveDraft({
      id: draftId, // Include draft ID if editing existing draft
      accountId: fromAccountId,
      accountColor: selectedAccount?.color as 'blue' | 'green' | 'purple' | 'orange' | 'red',
      from: {
        name: selectedAccount?.name ?? 'You',
        email: selectedAccount?.email ?? '',
      },
      to: parseRecipients(to),
      cc: showCc && cc.length > 0 ? parseRecipients(cc) : undefined,
      bcc: showBcc && bcc.length > 0 ? parseRecipients(bcc) : undefined,
      subject,
      body,
      replyToId,
      forwardedFromId,
    })
  }

  const handleDiscardDraft = () => {
    // If editing an existing draft, delete it
    if (draftId) {
      deleteEmails([draftId])
    }
    resetForm()
    closeCompose()
  }

  const title = subject || 'New Message'

  // Content shared between all states
  const composeContent = (
    <>
      <ComposeHeader
        title={title}
        state={composeState === 'minimized' ? 'minimized' : composeState === 'maximized' ? 'maximized' : 'open'}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
        isDraggable={composeState === 'open'}
      />

      {composeState !== 'minimized' && (
        <div className={styles.content}>
          {/* From account selector */}
          <div className={styles.fromField}>
            <label className={styles.fieldLabel}>From</label>
            <select
              className={styles.accountSelect}
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} &lt;{account.email}&gt;
                </option>
              ))}
            </select>
          </div>

          <div className={styles.recipients}>
            <RecipientField
              label="To"
              recipients={to}
              onChange={setTo}
            />

            <div className={styles.recipientActions}>
              {!showCc && (
                <button
                  type="button"
                  className={styles.addFieldButton}
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  className={styles.addFieldButton}
                  onClick={() => setShowBcc(true)}
                >
                  Bcc
                </button>
              )}
            </div>

            {showCc && (
              <RecipientField
                label="Cc"
                recipients={cc}
                onChange={setCc}
              />
            )}
            {showBcc && (
              <RecipientField
                label="Bcc"
                recipients={bcc}
                onChange={setBcc}
              />
            )}
          </div>

          <div className={styles.subjectField}>
            <input
              type="text"
              className={styles.subjectInput}
              placeholder={PLACEHOLDERS.SUBJECT}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <RichTextToolbar editorRef={editorRef} />

          <div
            ref={editorRef}
            className={styles.body}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={PLACEHOLDERS.COMPOSE_BODY}
            onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
          />

          <div className={styles.actions}>
            <Button variant="primary" onClick={handleSend} disabled={to.length === 0 || isSending}>
              <Icon name="send" size={16} />
              {isSending ? 'Sending...' : 'Send'}
            </Button>
            <div className={styles.secondaryActions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={handleSaveDraft}
                title="Save draft"
              >
                <Icon name="archive" size={18} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={handleDiscardDraft}
                title="Discard"
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )

  // Minimized state: fixed position bottom-right
  if (composeState === 'minimized') {
    return (
      <div className={cn(styles.composeWindow, styles.minimized)}>
        {composeContent}
      </div>
    )
  }

  // Maximized state: fixed position with inset
  if (composeState === 'maximized') {
    return (
      <div className={cn(styles.composeWindow, styles.maximized)}>
        {composeContent}
      </div>
    )
  }

  // Open state: use react-rnd for resize and drag
  const maxWidth = typeof window !== 'undefined'
    ? window.innerWidth * COMPOSE_WINDOW.MAX_WIDTH_PERCENT
    : COMPOSE_WINDOW.DEFAULT_WIDTH
  const maxHeight = typeof window !== 'undefined'
    ? window.innerHeight * COMPOSE_WINDOW.MAX_HEIGHT_PERCENT
    : COMPOSE_WINDOW.DEFAULT_HEIGHT

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      minWidth={COMPOSE_WINDOW.MIN_WIDTH}
      minHeight={COMPOSE_WINDOW.MIN_HEIGHT}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      bounds="window"
      dragHandleClassName={DRAG_HANDLE_CLASS}
      onDragStop={(_e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(_e, _direction, ref, _delta, pos) => {
        setSize({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        })
        setPosition(pos)
      }}
      className={cn(styles.composeWindow, styles.open)}
      style={{ zIndex: 'var(--z-compose)' }}
    >
      {composeContent}
    </Rnd>
  )
}
