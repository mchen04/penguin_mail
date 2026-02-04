/**
 * ToastContainer - Renders toast notifications
 */

import { useToast, type Toast, type ToastType } from '@/context/ToastContext'
import { Icon, type IconName } from '@/components/common/Icon/Icon'
import { ICON_SIZE } from '@/constants'
import styles from './Toast.module.css'

const TOAST_ICONS: Record<ToastType, IconName> = {
  success: 'check',
  error: 'close',
  info: 'help',
  warning: 'help',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className={styles.container} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: () => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  return (
    <div
      className={`${styles.toast} ${styles[toast.type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconWrapper}>
        <Icon name={TOAST_ICONS[toast.type]} size={ICON_SIZE.DEFAULT} />
      </div>
      <span className={styles.message}>{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => {
            toast.action?.onClick()
            onDismiss()
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        className={styles.dismissButton}
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <Icon name="close" size={ICON_SIZE.SMALL} />
      </button>
    </div>
  )
}
