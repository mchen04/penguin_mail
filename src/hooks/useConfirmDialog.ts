/**
 * useConfirmDialog - Hook for managing confirmation dialog state
 * Makes it easy to show confirmation dialogs for destructive actions
 */

import { useState, useCallback } from 'react'
import type { ConfirmDialogVariant } from '@/components/common/ConfirmDialog/ConfirmDialog'

interface ConfirmDialogConfig {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmDialogVariant
  onConfirm: () => void | Promise<void>
}

interface UseConfirmDialogReturn {
  isOpen: boolean
  config: ConfirmDialogConfig | null
  show: (config: ConfirmDialogConfig) => void
  close: () => void
  confirm: () => Promise<void>
  isLoading: boolean
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmDialogConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const show = useCallback((newConfig: ConfirmDialogConfig) => {
    setConfig(newConfig)
    setIsOpen(true)
    setIsLoading(false)
  }, [])

  const close = useCallback(() => {
    if (!isLoading) {
      setIsOpen(false)
      setConfig(null)
    }
  }, [isLoading])

  const confirm = useCallback(async () => {
    if (!config) return

    setIsLoading(true)
    try {
      await config.onConfirm()
      setIsOpen(false)
      setConfig(null)
    } catch (error) {
      console.error('[useConfirmDialog] Confirm action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [config])

  return {
    isOpen,
    config,
    show,
    close,
    confirm,
    isLoading,
  }
}

/**
 * Pre-configured confirmation dialogs for common actions
 */
export function useDestructiveActions() {
  const dialog = useConfirmDialog()

  const confirmEmptyTrash = useCallback((onConfirm: () => void) => {
    dialog.show({
      title: 'Empty Trash?',
      message: 'All emails in trash will be permanently deleted. This action cannot be undone.',
      confirmLabel: 'Empty Trash',
      variant: 'danger',
      onConfirm,
    })
  }, [dialog])

  const confirmEmptySpam = useCallback((onConfirm: () => void) => {
    dialog.show({
      title: 'Empty Spam?',
      message: 'All emails in spam will be permanently deleted. This action cannot be undone.',
      confirmLabel: 'Empty Spam',
      variant: 'danger',
      onConfirm,
    })
  }, [dialog])

  const confirmPermanentDelete = useCallback((count: number, onConfirm: () => void) => {
    dialog.show({
      title: 'Delete Permanently?',
      message: count === 1
        ? 'This email will be permanently deleted. This action cannot be undone.'
        : `${count} emails will be permanently deleted. This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm,
    })
  }, [dialog])

  return {
    ...dialog,
    confirmEmptyTrash,
    confirmEmptySpam,
    confirmPermanentDelete,
  }
}
