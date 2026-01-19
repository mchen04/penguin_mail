/**
 * useEmailActions - Hook that wraps email operations with toast notifications and undo support
 */

import { useCallback } from 'react'
import { useEmail } from '@/context/EmailContext'
import { useToast } from '@/context/ToastContext'
import { useUndoStack } from './useUndoStack'
import { UNDO_STACK } from '@/constants'
import type { FolderType } from '@/types/email'

/** Folder display names for toast messages */
const FOLDER_NAMES: Record<string, string> = {
  inbox: 'Inbox',
  sent: 'Sent',
  drafts: 'Drafts',
  trash: 'Trash',
  spam: 'Spam',
  archive: 'Archive',
  starred: 'Starred',
}

export function useEmailActions() {
  const {
    emails,
    deleteEmails,
    deletePermanently,
    emptyFolder,
    archiveEmails,
    moveToFolder,
    markAsSpam,
    markNotSpam,
    markRead,
    markUnread,
    toggleStar,
    sendEmail,
    saveDraft,
    clearSelection,
  } = useEmail()

  const toast = useToast()
  const undoStack = useUndoStack({ expireTime: UNDO_STACK.DEFAULT_EXPIRE_TIME })

  const handleDelete = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return

      // Get previous folders for undo
      const emailsToDelete = emails.filter((e) => ids.includes(e.id))
      const previousFolders = new Map(emailsToDelete.map((e) => [e.id, e.folder]))

      deleteEmails(ids)
      clearSelection()

      const message = ids.length === 1
        ? 'Email moved to trash'
        : `${ids.length} emails moved to trash`

      const undoAction = undoStack.push(
        'delete',
        message,
        () => {
          // Restore each email to its original folder
          previousFolders.forEach((folder, id) => {
            moveToFolder([id], folder)
          })
        },
        { ids, previousFolders }
      )

      toast.info(message, {
        label: 'Undo',
        onClick: () => undoStack.undoById(undoAction.id),
      })
    },
    [emails, deleteEmails, moveToFolder, clearSelection, toast, undoStack]
  )

  const handleArchive = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return

      const emailsToArchive = emails.filter((e) => ids.includes(e.id))
      const previousFolders = new Map(emailsToArchive.map((e) => [e.id, e.folder]))

      archiveEmails(ids)
      clearSelection()

      const message = ids.length === 1
        ? 'Email archived'
        : `${ids.length} emails archived`

      const undoAction = undoStack.push(
        'archive',
        message,
        () => {
          previousFolders.forEach((folder, id) => {
            moveToFolder([id], folder)
          })
        },
        { ids, previousFolders }
      )

      toast.info(message, {
        label: 'Undo',
        onClick: () => undoStack.undoById(undoAction.id),
      })
    },
    [emails, archiveEmails, moveToFolder, clearSelection, toast, undoStack]
  )

  const handleMarkRead = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      markRead(ids)
      toast.success(ids.length === 1 ? 'Marked as read' : `${ids.length} emails marked as read`)
    },
    [markRead, toast]
  )

  const handleMarkUnread = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      markUnread(ids)
      toast.success(ids.length === 1 ? 'Marked as unread' : `${ids.length} emails marked as unread`)
    },
    [markUnread, toast]
  )

  const handleToggleStar = useCallback(
    (id: string) => {
      const email = emails.find((e) => e.id === id)
      toggleStar(id)
      toast.success(email?.isStarred ? 'Removed from starred' : 'Added to starred')
    },
    [emails, toggleStar, toast]
  )

  const handleSendEmail = useCallback(
    async (email: Parameters<typeof sendEmail>[0]) => {
      await sendEmail(email)
      toast.success('Email sent')
    },
    [sendEmail, toast]
  )

  const handleSaveDraft = useCallback(
    async (email: Parameters<typeof saveDraft>[0]) => {
      await saveDraft(email)
      toast.info('Draft saved')
    },
    [saveDraft, toast]
  )

  const handleMoveToFolder = useCallback(
    (ids: string[], folder: FolderType) => {
      if (ids.length === 0) return

      const emailsToMove = emails.filter((e) => ids.includes(e.id))
      const previousFolders = new Map(emailsToMove.map((e) => [e.id, e.folder]))

      moveToFolder(ids, folder)
      clearSelection()

      const folderName = FOLDER_NAMES[folder] ?? folder
      const message = ids.length === 1
        ? `Moved to ${folderName}`
        : `${ids.length} emails moved to ${folderName}`

      const undoAction = undoStack.push(
        'move',
        message,
        () => {
          previousFolders.forEach((prevFolder, id) => {
            moveToFolder([id], prevFolder)
          })
        },
        { ids, folder, previousFolders }
      )

      toast.info(message, {
        label: 'Undo',
        onClick: () => undoStack.undoById(undoAction.id),
      })
    },
    [emails, moveToFolder, clearSelection, toast, undoStack]
  )

  const handleDeletePermanently = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      deletePermanently(ids)
      clearSelection()
      const message = ids.length === 1
        ? 'Email permanently deleted'
        : `${ids.length} emails permanently deleted`
      toast.success(message)
    },
    [deletePermanently, clearSelection, toast]
  )

  const handleEmptyTrash = useCallback(() => {
    emptyFolder('trash')
    toast.success('Trash emptied')
  }, [emptyFolder, toast])

  const handleEmptySpam = useCallback(() => {
    emptyFolder('spam')
    toast.success('Spam folder emptied')
  }, [emptyFolder, toast])

  const handleMarkAsSpam = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return

      const emailsToMark = emails.filter((e) => ids.includes(e.id))
      const previousFolders = new Map(emailsToMark.map((e) => [e.id, e.folder]))

      markAsSpam(ids)
      clearSelection()

      const message = ids.length === 1
        ? 'Marked as spam'
        : `${ids.length} emails marked as spam`

      const undoAction = undoStack.push(
        'spam',
        message,
        () => {
          previousFolders.forEach((folder, id) => {
            moveToFolder([id], folder)
          })
        },
        { ids, previousFolders }
      )

      toast.info(message, {
        label: 'Undo',
        onClick: () => undoStack.undoById(undoAction.id),
      })
    },
    [emails, markAsSpam, moveToFolder, clearSelection, toast, undoStack]
  )

  const handleMarkNotSpam = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      markNotSpam(ids)
      clearSelection()
      const message = ids.length === 1
        ? 'Moved to inbox'
        : `${ids.length} emails moved to inbox`
      toast.success(message)
    },
    [markNotSpam, clearSelection, toast]
  )

  return {
    deleteEmails: handleDelete,
    deletePermanently: handleDeletePermanently,
    emptyTrash: handleEmptyTrash,
    emptySpam: handleEmptySpam,
    archiveEmails: handleArchive,
    markRead: handleMarkRead,
    markUnread: handleMarkUnread,
    toggleStar: handleToggleStar,
    sendEmail: handleSendEmail,
    saveDraft: handleSaveDraft,
    moveToFolder: handleMoveToFolder,
    markAsSpam: handleMarkAsSpam,
    markNotSpam: handleMarkNotSpam,
    // Expose undo stack for advanced usage
    undoStack,
  }
}
