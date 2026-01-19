import { useState, useMemo, useCallback } from 'react'
import type { Email } from '@/types/email'
import { useApp } from '@/context/AppContext'
import { useEmail } from '@/context/EmailContext'
import { useSettings } from '@/context/SettingsContext'
import { EmailHeader } from './EmailHeader'
import { EmailBody } from './EmailBody'
import { AttachmentPreview } from './AttachmentPreview'
import { Icon } from '@/components/common/Icon/Icon'
import { formatDate } from '@/utils/formatDate'
import { printEmail } from '@/utils/printEmail'
import styles from './EmailView.module.css'

interface EmailViewProps {
  email: Email
  onBack: () => void
  onToggleStar: () => void
  onArchive: () => void
  onDelete: () => void
}

export function EmailView({
  email,
  onBack,
  onToggleStar,
  onArchive,
  onDelete,
}: EmailViewProps) {
  const { openReply, openReplyAll, openForward } = useApp()
  const { emails } = useEmail()
  const { conversationView } = useSettings()
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set([email.id]))

  // Get all emails in this thread
  const threadEmails = useMemo(() => {
    if (!conversationView) return [email]

    return emails
      .filter((e) => e.threadId === email.threadId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [emails, email, conversationView])

  const isThread = threadEmails.length > 1

  const toggleEmailExpanded = (emailId: string) => {
    setExpandedEmails((prev) => {
      const next = new Set(prev)
      if (next.has(emailId)) {
        next.delete(emailId)
      } else {
        next.add(emailId)
      }
      return next
    })
  }

  // Reply to the specific email (in thread view, reply to that message)
  const handleReply = useCallback((targetEmail: Email = email) => {
    openReply(targetEmail)
  }, [email, openReply])

  const handleReplyAll = useCallback((targetEmail: Email = email) => {
    openReplyAll(targetEmail)
  }, [email, openReplyAll])

  const handleForward = useCallback((targetEmail: Email = email) => {
    openForward(targetEmail)
  }, [email, openForward])

  const handlePrint = useCallback(() => {
    printEmail(email)
  }, [email])

  // Single email view
  if (!isThread) {
    return (
      <div className={styles.emailView}>
        <EmailHeader
          email={email}
          onBack={onBack}
          onReply={() => handleReply(email)}
          onReplyAll={() => handleReplyAll(email)}
          onForward={() => handleForward(email)}
          onArchive={onArchive}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
          onPrint={handlePrint}
        />
        <EmailBody html={email.body} />
        {email.attachments && email.attachments.length > 0 && (
          <AttachmentPreview attachments={email.attachments} />
        )}
      </div>
    )
  }

  // Thread view
  return (
    <div className={styles.emailView}>
      <div className={styles.threadHeader}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          <Icon name="arrowLeft" size={20} />
        </button>
        <div className={styles.threadInfo}>
          <h2 className={styles.threadSubject}>{email.subject}</h2>
          <span className={styles.threadCount}>{threadEmails.length} messages</span>
        </div>
        <div className={styles.threadActions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onToggleStar}
            title="Star"
          >
            <Icon name={email.isStarred ? 'starFilled' : 'star'} size={18} />
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onArchive}
            title="Archive"
          >
            <Icon name="archive" size={18} />
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onDelete}
            title="Delete"
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>

      <div className={styles.threadMessages}>
        {threadEmails.map((threadEmail, index) => {
          const isExpanded = expandedEmails.has(threadEmail.id)
          const isLast = index === threadEmails.length - 1

          return (
            <div
              key={threadEmail.id}
              className={`${styles.threadMessage} ${isExpanded ? styles.expanded : ''} ${isLast ? styles.lastMessage : ''}`}
            >
              <button
                type="button"
                className={styles.messageHeader}
                onClick={() => toggleEmailExpanded(threadEmail.id)}
              >
                <div className={styles.messageSender}>
                  <span
                    className={styles.senderAvatar}
                    style={{ background: `var(--color-account-${threadEmail.accountColor})` }}
                  >
                    {threadEmail.from.name.charAt(0).toUpperCase()}
                  </span>
                  <div className={styles.senderInfo}>
                    <span className={styles.senderName}>{threadEmail.from.name}</span>
                    {!isExpanded && (
                      <span className={styles.messagePreview}>{threadEmail.preview}</span>
                    )}
                  </div>
                </div>
                <div className={styles.messageDate}>
                  {formatDate(threadEmail.date)}
                  <Icon
                    name={isExpanded ? 'chevronDown' : 'chevronRight'}
                    size={16}
                    className={styles.expandIcon}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className={styles.messageContent}>
                  <div className={styles.messageRecipients}>
                    <span className={styles.recipientLabel}>To:</span>
                    <span className={styles.recipientList}>
                      {threadEmail.to.map((r) => r.name || r.email).join(', ')}
                    </span>
                  </div>
                  <EmailBody html={threadEmail.body} />
                  {threadEmail.attachments && threadEmail.attachments.length > 0 && (
                    <AttachmentPreview attachments={threadEmail.attachments} />
                  )}
                  <div className={styles.messageActions}>
                    <button type="button" className={styles.replyButton} onClick={() => handleReply(threadEmail)}>
                      <Icon name="reply" size={16} />
                      Reply
                    </button>
                    <button type="button" className={styles.replyButton} onClick={() => handleReplyAll(threadEmail)}>
                      <Icon name="replyAll" size={16} />
                      Reply All
                    </button>
                    <button type="button" className={styles.replyButton} onClick={() => handleForward(threadEmail)}>
                      <Icon name="forward" size={16} />
                      Forward
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
