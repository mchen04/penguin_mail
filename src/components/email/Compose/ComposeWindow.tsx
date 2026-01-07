import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useDraggable } from '@/hooks/useDraggable'
import { Button } from '@/components/common/Button/Button'
import { Icon } from '@/components/common/Icon/Icon'
import { ComposeHeader } from './ComposeHeader'
import { RecipientField } from './RecipientField'
import { cn } from '@/utils/cn'
import styles from './ComposeWindow.module.css'

export function ComposeWindow() {
  const { composeState, closeCompose, minimizeCompose, maximizeCompose, openCompose } = useApp()
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState<string[]>([])
  const [showCc, setShowCc] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const { position, isDragging, handleMouseDown, resetPosition } = useDraggable()

  if (composeState === 'closed') return null

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
      resetPosition()
    } else {
      maximizeCompose()
    }
  }

  const handleClose = () => {
    // Reset form state
    setTo([])
    setCc([])
    setShowCc(false)
    setSubject('')
    setBody('')
    resetPosition()
    closeCompose()
  }

  const handleSend = () => {
    // In a real app, this would send the email via API
    handleClose()
  }

  const title = subject || 'New Message'

  // Map composeState to CSS class names (minimized, maximized, or default to open)
  const stateClass = composeState === 'minimized' ? 'minimized' :
                     composeState === 'maximized' ? 'maximized' : 'open'

  // Use CSS custom properties for positioning, allowing CSS media queries to override
  const windowStyle = {
    '--compose-x': `${position.x}px`,
    '--compose-y': `${position.y}px`,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        styles.composeWindow,
        styles[stateClass],
        isDragging && styles.dragging
      )}
      style={windowStyle}
    >
      <ComposeHeader
        title={title}
        state={stateClass}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
        onMouseDown={composeState === 'open' ? handleMouseDown : undefined}
        isDragging={isDragging}
      />

      {composeState !== 'minimized' && (
        <div className={styles.content}>
          {/* Recipients */}
          <div className={styles.recipients}>
            <RecipientField
              label="To"
              recipients={to}
              onChange={setTo}
            />
            {!showCc && (
              <button
                type="button"
                className={styles.addCcButton}
                onClick={() => setShowCc(true)}
              >
                Cc
              </button>
            )}
            {showCc && (
              <RecipientField
                label="Cc"
                recipients={cc}
                onChange={setCc}
              />
            )}
          </div>

          {/* Subject */}
          <div className={styles.subjectField}>
            <input
              type="text"
              className={styles.subjectInput}
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <textarea
            className={styles.body}
            placeholder="Compose your message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          {/* Actions */}
          <div className={styles.actions}>
            <Button variant="primary" onClick={handleSend}>
              <Icon name="send" size={16} />
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
