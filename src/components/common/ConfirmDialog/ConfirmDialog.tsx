/**
 * ConfirmDialog - Reusable confirmation dialog for destructive actions
 */

import { Modal } from '@/components/common/Modal/Modal'
import { Button } from '@/components/common/Button/Button'
import { Icon, type IconName } from '@/components/common/Icon/Icon'
import styles from './ConfirmDialog.module.css'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmDialogVariant
  isLoading?: boolean
}

const VARIANT_ICONS: Record<ConfirmDialogVariant, IconName> = {
  danger: 'trash',
  warning: 'alertOctagon',
  info: 'help',
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className={styles.content}>
        <div className={`${styles.iconWrapper} ${styles[variant]}`}>
          <Icon name={VARIANT_ICONS[variant]} size={24} />
        </div>
        <p className={styles.message}>{message}</p>
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
