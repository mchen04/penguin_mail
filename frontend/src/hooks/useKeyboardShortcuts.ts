/**
 * Keyboard Shortcuts Hook
 * Handles global keyboard shortcuts for the email client
 */

import { useEffect, useCallback } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { useEmail } from '@/context/EmailContext'
import { useApp } from '@/context/AppContext'

interface ShortcutHandlers {
  onCompose?: () => void
  onReply?: () => void
  onReplyAll?: () => void
  onForward?: () => void
  onArchive?: () => void
  onDelete?: () => void
  onMarkRead?: () => void
  onMarkUnread?: () => void
  onToggleStar?: () => void
  onSelectAll?: () => void
  onSearch?: () => void
  onEscape?: () => void
  onNextEmail?: () => void
  onPrevEmail?: () => void
  onOpenEmail?: () => void
  onGoToInbox?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const { getShortcut } = useSettings()
  const {
    filteredEmails,
    selectedEmailId,
    selectEmail,
    selectedIds,
    toggleStar,
    markRead,
    markUnread,
    deleteEmails,
    archiveEmails,
    selectAll,
    setFolder,
  } = useEmail()
  const { openCompose, closeCompose, composeState, closeSettings, settingsOpen } = useApp()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' ||
                     target.tagName === 'TEXTAREA' ||
                     target.isContentEditable

      // Allow escape even in inputs
      if (isInput && event.key !== 'Escape') return

      // Check if shortcut matches
      const matchesShortcut = (shortcutId: string) => {
        const shortcut = getShortcut(shortcutId)
        if (!shortcut?.enabled) return false

        const key = event.key.toLowerCase()
        const shortcutKey = shortcut.key.toLowerCase()

        if (key !== shortcutKey) return false

        const hasCtrl = event.ctrlKey || event.metaKey
        const hasAlt = event.altKey
        const hasShift = event.shiftKey

        const needsCtrl = shortcut.modifiers.includes('ctrl') || shortcut.modifiers.includes('meta')
        const needsAlt = shortcut.modifiers.includes('alt')
        const needsShift = shortcut.modifiers.includes('shift')

        return hasCtrl === needsCtrl && hasAlt === needsAlt && hasShift === needsShift
      }

      // Get selected email IDs (or current email if none selected)
      const getTargetIds = (): string[] => {
        if (selectedIds.size > 0) {
          return Array.from(selectedIds)
        }
        if (selectedEmailId) {
          return [selectedEmailId]
        }
        return []
      }

      // Handle shortcuts
      if (matchesShortcut('compose')) {
        event.preventDefault()
        if (handlers.onCompose) handlers.onCompose()
        else openCompose()
      } else if (matchesShortcut('archive')) {
        event.preventDefault()
        const ids = getTargetIds()
        if (ids.length > 0) {
          if (handlers.onArchive) handlers.onArchive()
          else archiveEmails(ids)
        }
      } else if (matchesShortcut('delete')) {
        event.preventDefault()
        const ids = getTargetIds()
        if (ids.length > 0) {
          if (handlers.onDelete) handlers.onDelete()
          else deleteEmails(ids)
        }
      } else if (matchesShortcut('markRead')) {
        event.preventDefault()
        const ids = getTargetIds()
        if (ids.length > 0) {
          if (handlers.onMarkRead) handlers.onMarkRead()
          else markRead(ids)
        }
      } else if (matchesShortcut('markUnread')) {
        event.preventDefault()
        const ids = getTargetIds()
        if (ids.length > 0) {
          if (handlers.onMarkUnread) handlers.onMarkUnread()
          else markUnread(ids)
        }
      } else if (matchesShortcut('star')) {
        event.preventDefault()
        const ids = getTargetIds()
        ids.forEach((id) => {
          if (handlers.onToggleStar) handlers.onToggleStar()
          else toggleStar(id)
        })
      } else if (matchesShortcut('selectAll')) {
        event.preventDefault()
        if (handlers.onSelectAll) handlers.onSelectAll()
        else selectAll()
      } else if (matchesShortcut('search')) {
        event.preventDefault()
        handlers.onSearch?.()
        // Focus search input
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        searchInput?.focus()
      } else if (matchesShortcut('escape')) {
        event.preventDefault()
        if (composeState !== 'closed') {
          closeCompose()
        } else if (settingsOpen) {
          closeSettings()
        } else if (selectedEmailId) {
          selectEmail(null)
        }
        handlers.onEscape?.()
      } else if (matchesShortcut('nextEmail')) {
        event.preventDefault()
        const currentIndex = filteredEmails.findIndex((e) => e.id === selectedEmailId)
        const nextEmail = filteredEmails[currentIndex + 1]
        if (nextEmail) {
          selectEmail(nextEmail.id)
        }
        handlers.onNextEmail?.()
      } else if (matchesShortcut('prevEmail')) {
        event.preventDefault()
        const currentIndex = filteredEmails.findIndex((e) => e.id === selectedEmailId)
        const prevEmail = filteredEmails[currentIndex - 1]
        if (prevEmail) {
          selectEmail(prevEmail.id)
        }
        handlers.onPrevEmail?.()
      } else if (matchesShortcut('openEmail')) {
        event.preventDefault()
        // Select first email if none selected
        if (!selectedEmailId && filteredEmails.length > 0) {
          selectEmail(filteredEmails[0].id)
        }
        handlers.onOpenEmail?.()
      } else if (matchesShortcut('goToInbox')) {
        event.preventDefault()
        setFolder('inbox')
        handlers.onGoToInbox?.()
      }
    },
    [
      getShortcut,
      handlers,
      openCompose,
      closeCompose,
      composeState,
      closeSettings,
      settingsOpen,
      selectedEmailId,
      selectedIds,
      selectEmail,
      toggleStar,
      markRead,
      markUnread,
      deleteEmails,
      archiveEmails,
      selectAll,
      setFolder,
      filteredEmails,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
