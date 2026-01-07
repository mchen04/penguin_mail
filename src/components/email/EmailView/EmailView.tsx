import type { Email } from '@/types/email'
import { useApp } from '@/context/AppContext'
import { EmailHeader } from './EmailHeader'
import { EmailBody } from './EmailBody'
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
  const { openCompose } = useApp()

  const handleReply = () => {
    // In a real app, this would open compose with reply data
    openCompose()
  }

  const handleReplyAll = () => {
    openCompose()
  }

  const handleForward = () => {
    openCompose()
  }

  return (
    <div className={styles.emailView}>
      <EmailHeader
        email={email}
        onBack={onBack}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onArchive={onArchive}
        onDelete={onDelete}
        onToggleStar={onToggleStar}
      />
      <EmailBody html={email.body} />
    </div>
  )
}
