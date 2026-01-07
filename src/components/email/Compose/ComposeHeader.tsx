import { IconButton } from '@/components/common/IconButton/IconButton'
import styles from './ComposeHeader.module.css'

type ComposeState = 'open' | 'minimized' | 'maximized'

interface ComposeHeaderProps {
  title: string
  state: ComposeState
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  isDragging?: boolean
}

export function ComposeHeader({
  title,
  state,
  onMinimize,
  onMaximize,
  onClose,
  onMouseDown,
  isDragging,
}: ComposeHeaderProps) {
  return (
    <div
      className={styles.header}
      onMouseDown={onMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <span className={styles.title}>{title}</span>
      <div className={styles.controls}>
        <IconButton
          icon="minimize"
          label={state === 'minimized' ? 'Restore' : 'Minimize'}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onMinimize()
          }}
        />
        <IconButton
          icon="maximize"
          label={state === 'maximized' ? 'Restore' : 'Maximize'}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onMaximize()
          }}
        />
        <IconButton
          icon="close"
          label="Close"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        />
      </div>
    </div>
  )
}
