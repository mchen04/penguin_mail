/**
 * useEmailActions - Hook that wraps email operations with toast notifications and undo support
 */

import { useCallback, useRef } from 'react'
import { useEmail } from '@/context/EmailContext'
import { useToast } from '@/context/ToastContext'
import type { FolderType } from '@/types/email'

interface UndoState {
  type: 'delete' | 'archive' | 'move' | 'spam'
  ids: string[]
  previousFolder: FolderType
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
  const undoStateRef = useRef<UndoState | null>(null)

  const handleDelete = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return

      // Store state for undo
      const emailsToDelete = emails.filter((e) => ids.includes(e.id))
      if (emailsToDelete.length > 0) {
        undoStateRef.current = {
          type: 'delete',
          ids,
          previousFolder: emailsToDelete[0].folder,
        }
      }

      deleteEmails(ids)
      clearSelection()

      const message = ids.length === 1
        ? 'Email moved to trash'
        : `${ids.length} emails moved to trash`

      toast.info(message, {
        label: 'Undo',
        onClick: () => {
          if (undoStateRef.current?.type === 'delete') {
            moveToFolder(undoStateRef.current.ids, undoStateRef.current.previousFolder)
            undoStateRef.current = null
          }
        },
      })
    },
    [emails, deleteEmails, moveToFolder, clearSelection, toast]
  )

  const handleArchive = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return

      // Store state for undo
      const emailsToArchive = emails.filter((e) => ids.includes(e.id))
      if (emailsToArchive.length > 0) {
        undoStateRef.current = {
          type: 'archive',
          ids,
          previousFolder: emailsToArchive[0].folder,
        }
      }

      archiveEmails(ids)
      clearSelection()

      const message = ids.length === 1
        ? 'Email archived'
        : `${ids.length} emails archived`

      toast.info(message, {
        label: 'Undo',
        onClick: () => {
          if (undoStateRef.current?.type === 'archive') {
            moveToFolder(undoStateRef.current.ids, undoStateRef.current.previousFolder)
            undoStateRef.current = null
          }
        },
      })
    },
    [emails, archiveEmails, moveToFolder, clearSelection, toast]
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
      if (emailsToMove.length > 0) {
        undoStateRef.current = {
          type: 'move',
          ids,
          previousFolder: emailsToMove[0].folder,
        }
      }

      moveToFolder(ids, folder)
      clearSelection()

      const folderNames: Record<FolderType, string> = {
        inbox: 'Inbox',
        sent: 'Sent',
        drafts: 'Drafts',
        trash: 'Trash',
        spam: 'Spam',
        archive: 'Archive',
        starred: 'Starred',
      }

      const message = ids.length === 1
        ? `Moved to ${folderNames[folder]}`
        : `${ids.length} emails moved to ${folderNames[folder]}`

      toast.info(message, {
        label: 'Undo',
        onClick: () => {
          if (undoStateRef.current?.type === 'move') {
            moveToFolder(undoStateRef.current.ids, undoStateRef.current.previousFolder)
            undoStateRef.current = null
          }
        },
      })
    },
    [emails, moveToFolder, clearSelection, toast]
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
      if (emailsToMark.length > 0) {
        undoStateRef.current = {
          type: 'spam',
          ids,
          previousFolder: emailsToMark[0].folder,
        }
      }

      markAsSpam(ids)
      clearSelection()

      const message = ids.length === 1
        ? 'Marked as spam'
        : `${ids.length} emails marked as spam`

      toast.info(message, {
        label: 'Undo',
        onClick: () => {
          if (undoStateRef.current?.type === 'spam') {
            moveToFolder(undoStateRef.current.ids, undoStateRef.current.previousFolder)
            undoStateRef.current = null
          }
        },
      })
    },
    [emails, markAsSpam, moveToFolder, clearSelection, toast]
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
  }
}
