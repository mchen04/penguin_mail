import { useState } from 'react'
import { Rnd } from 'react-rnd'
import { useApp } from '@/context/AppContext'
import { useComposeWindowState } from '@/hooks/useComposeWindowState'
import { Button } from '@/components/common/Button/Button'
import { Icon } from '@/components/common/Icon/Icon'
import { ComposeHeader, DRAG_HANDLE_CLASS } from './ComposeHeader'
import { RecipientField } from './RecipientField'
import { PLACEHOLDERS, LABELS, COMPOSE_WINDOW } from '@/constants'
import { cn } from '@/utils/cn'
import styles from './ComposeWindow.module.css'

export function ComposeWindow() {
  const { composeState, closeCompose, minimizeCompose, maximizeCompose, openCompose } = useApp()
  const { size, position, setSize, setPosition } = useComposeWindowState()
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState<string[]>([])
  const [showCc, setShowCc] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

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
    } else {
      maximizeCompose()
    }
  }

  const handleClose = () => {
    setTo([])
    setCc([])
    setShowCc(false)
    setSubject('')
    setBody('')
    closeCompose()
  }

  const handleSend = () => {
    handleClose()
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
                {LABELS.CC}
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

          <div className={styles.subjectField}>
            <input
              type="text"
              className={styles.subjectInput}
              placeholder={PLACEHOLDERS.SUBJECT}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <textarea
            className={styles.body}
            placeholder={PLACEHOLDERS.COMPOSE_BODY}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div className={styles.actions}>
            <Button variant="primary" onClick={handleSend}>
              <Icon name="send" size={16} />
              Send
            </Button>
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
