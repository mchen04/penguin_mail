import { useState, useCallback, useEffect, useRef, useMemo, type DragEvent, type ChangeEvent } from 'react'
import { useApp } from '@/context/AppContext'
import { useAccounts } from '@/context/AccountContext'
import { useEmail } from '@/context/EmailContext'
import { useSettings } from '@/context/SettingsContext'
import { useFeatures } from '@/context/FeaturesContext'
import { Button } from '@/components/common/Button/Button'
import { Icon } from '@/components/common/Icon/Icon'
import { ComposeHeader } from './ComposeHeader'
import { RecipientField } from './RecipientField'
import { RichTextToolbar } from './RichTextToolbar'
import { ScheduleSendPicker } from './ScheduleSendPicker'
import { PLACEHOLDERS, ICON_SIZE, AUTO_SAVE, RANDOM_ID } from '@/constants'
import { cn, formatBytes, formatRecipient, parseRecipients } from '@/utils'
import type { Attachment } from '@/types/email'
import styles from './ComposeWindow.module.css'

export function ComposeWindow() {
  const { composeState, composeData, closeCompose, minimizeCompose, maximizeCompose, openCompose } = useApp()
  const { accounts } = useAccounts()
  const { sendEmail, saveDraft, deleteEmails, scheduleEmail } = useEmail()
  const { signatures } = useSettings()
  const { templates } = useFeatures()

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
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  // Track if we've initialized from composeData
  const lastComposeDataRef = useRef<typeof composeData>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef({ to, subject, body, attachments })

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

  // Check if content has changed since last save
  const hasUnsavedChanges = useCallback(() => {
    const current = { to, subject, body, attachments }
    const last = lastSavedRef.current
    return (
      JSON.stringify(current.to) !== JSON.stringify(last.to) ||
      current.subject !== last.subject ||
      current.body !== last.body ||
      JSON.stringify(current.attachments.map(a => a.id)) !== JSON.stringify(last.attachments.map(a => a.id))
    )
  }, [to, subject, body, attachments])

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (composeState === 'closed') return

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set up new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      // Only auto-save if there's content and changes
      if ((to.length > 0 || subject || body || attachments.length > 0) && hasUnsavedChanges()) {
        setAutoSaveStatus('saving')
        try {
          const selectedAccount = accounts.find((a) => a.id === fromAccountId) ?? accounts[0]
          const result = await saveDraft({
            id: draftId,
            accountId: fromAccountId,
            accountColor: selectedAccount?.color as 'blue' | 'green' | 'purple' | 'orange' | 'red',
            from: {
              name: selectedAccount?.name ?? 'You',
              email: selectedAccount?.email ?? '',
            },
            to: parseRecipients(to),
            cc: showCc && cc.length > 0 ? parseRecipients(cc) : undefined,
            subject,
            body,
            attachments,
            replyToId,
            forwardedFromId,
          })
          if (!draftId && result) {
            // If this was a new draft, store the ID for future saves
            // Note: The saveDraft should return the draft with ID
          }
          lastSavedRef.current = { to, subject, body, attachments }
          setAutoSaveStatus('saved')
          // Reset to idle after 2 seconds
          setTimeout(() => setAutoSaveStatus('idle'), AUTO_SAVE.STATUS_RESET_DELAY)
        } catch {
          setAutoSaveStatus('idle')
        }
      }
    }, AUTO_SAVE.INTERVAL)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [composeState, to, subject, body, attachments, hasUnsavedChanges, draftId, fromAccountId, accounts, saveDraft, showCc, cc, replyToId, forwardedFromId])

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
    setAttachments([])
    setIsDraggingOver(false)
    setAutoSaveStatus('idle')
    setShowSchedulePicker(false)
    setShowTemplatePicker(false)
    lastComposeDataRef.current = null
    lastSavedRef.current = { to: [], subject: '', body: '', attachments: [] }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
  }, [accounts])

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `attachment-${Date.now()}-${Math.random().toString(36).slice(RANDOM_ID.SLICE_START, RANDOM_ID.SLICE_END_SHORT)}`,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: URL.createObjectURL(file),
    }))

    setAttachments((prev) => [...prev, ...newAttachments])
  }, [])

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id)
      if (removed?.url) {
        URL.revokeObjectURL(removed.url)
      }
      return prev.filter((a) => a.id !== id)
    })
  }, [])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to false if leaving the compose window entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

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
    if (to.length > 0 || subject || body || attachments.length > 0) {
      handleSaveDraft()
    }
    resetForm()
    closeCompose()
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
        attachments,
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
    if (to.length === 0 && !subject && !body && attachments.length === 0) return

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
      attachments,
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

  const handleScheduleSend = async (scheduledAt: Date) => {
    if (to.length === 0) return

    setIsSending(true)
    try {
      await scheduleEmail({
        id: draftId,
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
        attachments,
        replyToId,
        forwardedFromId,
        isDraft: !!draftId,
      }, scheduledAt)
      resetForm()
      closeCompose()
    } finally {
      setIsSending(false)
      setShowSchedulePicker(false)
    }
  }

  const handleApplyTemplate = (template: { subject: string; body: string }) => {
    setSubject(template.subject)
    setBody(template.body)
    if (editorRef.current) {
      editorRef.current.innerHTML = template.body
    }
    setShowTemplatePicker(false)
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
      />

      {composeState !== 'minimized' && (
        <div
          className={cn(styles.content, isDraggingOver && styles.draggingOver)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.hiddenFileInput}
            onChange={handleFileInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Drag overlay */}
          {isDraggingOver && (
            <div className={styles.dragOverlay}>
              <Icon name="attachment" size={ICON_SIZE.MEDIUM_XLARGE} />
              <span>Drop files to attach</span>
            </div>
          )}

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

          <div
            ref={editorRef}
            className={styles.body}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={PLACEHOLDERS.COMPOSE_BODY}
            onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
          />

          {/* Attachments list */}
          {attachments.length > 0 && (
            <div className={styles.attachmentsList}>
              {attachments.map((attachment) => (
                <div key={attachment.id} className={styles.attachmentItem}>
                  <Icon name="attachment" size={ICON_SIZE.XSMALL} />
                  <span className={styles.attachmentName}>{attachment.name}</span>
                  <span className={styles.attachmentSize}>{formatBytes(attachment.size)}</span>
                  <button
                    type="button"
                    className={styles.removeAttachment}
                    onClick={() => removeAttachment(attachment.id)}
                    title="Remove attachment"
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <Icon name="close" size={ICON_SIZE.XSMALL} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <div className={styles.primaryActions}>
              <Button variant="primary" size="small" onClick={handleSend} disabled={to.length === 0 || isSending}>
                <Icon name="send" size={ICON_SIZE.XSMALL} />
                {isSending ? 'Sending...' : 'Send'}
              </Button>
              <div className={styles.scheduleWrapper}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                  title="Schedule send"
                  disabled={to.length === 0}
                >
                  <Icon name="clock" size={ICON_SIZE.DEFAULT} />
                </button>
                {showSchedulePicker && (
                  <ScheduleSendPicker
                    onSchedule={handleScheduleSend}
                    onCancel={() => setShowSchedulePicker(false)}
                  />
                )}
              </div>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Icon name="attachment" size={ICON_SIZE.DEFAULT} />
              </button>
              {templates.length > 0 && (
                <div className={styles.templateWrapper}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                    title="Insert template"
                  >
                    <Icon name="compose" size={ICON_SIZE.DEFAULT} />
                  </button>
                  {showTemplatePicker && (
                    <div className={styles.templatePicker}>
                      <div className={styles.templateHeader}>Templates</div>
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          className={styles.templateItem}
                          onClick={() => handleApplyTemplate(template)}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <RichTextToolbar editorRef={editorRef} />

            {/* Auto-save status indicator */}
            {autoSaveStatus !== 'idle' && (
              <span className={styles.autoSaveStatus}>
                {autoSaveStatus === 'saving' ? 'Saving...' : 'Draft saved'}
              </span>
            )}

            <div className={styles.secondaryActions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={handleSaveDraft}
                title="Save draft"
              >
                <Icon name="archive" size={ICON_SIZE.DEFAULT} />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={handleDiscardDraft}
                title="Discard"
              >
                <Icon name="trash" size={ICON_SIZE.DEFAULT} />
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

  // Open state: fixed position at bottom-right
  return (
    <div className={cn(styles.composeWindow, styles.open)}>
      {composeContent}
    </div>
  )
}
