import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useEmail } from '@/context/EmailContext'
import { useAccounts } from '@/context/AccountContext'
import { useSettings } from '@/context/SettingsContext'
import { EmailRow } from './EmailRow'
import { Icon, type IconName } from '@/components/common/Icon/Icon'
import { EMAIL_LIST, ICON_SIZE } from '@/constants'
import type { Email } from '@/types/email'
import styles from './EmailList.module.css'

interface EmailListProps {
  onOpenEmail?: (emailId: string) => void
}

const EMPTY_STATES: Record<string, { icon: IconName; title: string; description: string }> = {
  inbox: {
    icon: 'inbox',
    title: 'Your inbox is empty',
    description: 'New emails will appear here',
  },
  starred: {
    icon: 'star',
    title: 'No starred emails',
    description: 'Star emails to find them easily later',
  },
  sent: {
    icon: 'send',
    title: 'No sent emails',
    description: 'Emails you send will appear here',
  },
  drafts: {
    icon: 'edit',
    title: 'No drafts',
    description: 'Emails you save as drafts will appear here',
  },
  trash: {
    icon: 'trash',
    title: 'Trash is empty',
    description: 'Deleted emails will appear here',
  },
  archive: {
    icon: 'archive',
    title: 'No archived emails',
    description: 'Archived emails will appear here',
  },
  spam: {
    icon: 'mail',
    title: 'No spam',
    description: 'Messages marked as spam will appear here',
  },
  default: {
    icon: 'mail',
    title: 'No emails',
    description: 'There are no emails to display',
  },
}

// Helper to get thread count for an email
interface EmailWithThreadInfo extends Email {
  threadCount: number
}

export function EmailList({ onOpenEmail }: EmailListProps) {
  const { selectedFolder } = useAccounts()
  const { conversationView } = useSettings()
  const {
    filteredEmails,
    searchQuery,
    currentFolder,
    selectEmail,
    toggleStar,
    markRead,
    markUnread,
    deleteEmails,
    archiveEmails,
    isSelected,
    toggleSelection,
    isLoading,
  } = useEmail()

  // Pagination state - resets when folder or search changes
  const [displayCount, setDisplayCount] = useState<number>(EMAIL_LIST.PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Group emails by thread when conversation view is enabled
  // Shows only the most recent email per thread with thread count
  const displayEmails = useMemo((): EmailWithThreadInfo[] => {
    if (!conversationView) {
      // No grouping - show all emails individually with thread count of 1
      return filteredEmails.map(email => ({ ...email, threadCount: 1 }))
    }

    // Group by threadId, keep the most recent (first since already sorted by date desc)
    const threadMap = new Map<string, { email: Email; count: number }>()

    for (const email of filteredEmails) {
      const existing = threadMap.get(email.threadId)
      if (existing) {
        existing.count++
        // Keep the more recent email (filteredEmails is sorted by date desc)
        // So the first one we encounter is the most recent
      } else {
        threadMap.set(email.threadId, { email, count: 1 })
      }
    }

    return Array.from(threadMap.values()).map(({ email, count }) => ({
      ...email,
      threadCount: count,
    }))
  }, [filteredEmails, conversationView])

  // Reset pagination when folder or search changes - this is a valid pattern
  // for resetting local state when dependencies from context change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayCount(EMAIL_LIST.PAGE_SIZE)
  }, [currentFolder, searchQuery])

  // Paginated emails
  const paginatedEmails = useMemo(
    () => displayEmails.slice(0, displayCount),
    [displayEmails, displayCount]
  )

  const hasMore = displayCount < displayEmails.length
  const totalCount = displayEmails.length

  // Infinite scroll sentinel ref
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return // Prevent multiple loads

    setIsLoadingMore(true)
    // Simulate network delay for realistic UX
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + EMAIL_LIST.PAGE_SIZE, displayEmails.length))
      setIsLoadingMore(false)
    }, EMAIL_LIST.LOAD_MORE_DELAY)
  }, [displayEmails.length, isLoadingMore])

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !isLoadingMore) {
          handleLoadMore()
        }
      },
      {
        root: null, // viewport
        rootMargin: EMAIL_LIST.INFINITE_SCROLL_ROOT_MARGIN, // load before reaching the bottom
        threshold: 0,
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoadingMore, handleLoadMore])

  // Use custom open handler if provided, otherwise use selectEmail
  const handleOpenEmail = onOpenEmail ?? selectEmail

  // Show loading skeleton while loading
  if (isLoading) {
    return (
      <div className={styles.list} role="grid" aria-label="Email list" aria-busy="true">
        <div className={styles.srOnly} aria-live="polite">Loading emails...</div>
        {Array.from({ length: EMAIL_LIST.SKELETON_COUNT }).map((_, i) => (
          <div key={i} className={styles.skeleton} aria-hidden="true">
            <div className={styles.skeletonCheckbox} />
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonContent}>
              {EMAIL_LIST.SKELETON_LINE_WIDTHS.map((width, index) => (
                <div key={index} className={styles.skeletonLine} style={{ width }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredEmails.length === 0) {
    // Show search empty state if searching
    if (searchQuery) {
      return (
        <div className={styles.empty}>
          <Icon name="search" size={ICON_SIZE.XLARGE} className={styles.emptyIcon} />
          <span className={styles.emptyTitle}>No results found</span>
          <span className={styles.emptyDescription}>
            No emails match &quot;{searchQuery}&quot;
          </span>
        </div>
      )
    }

    // Show folder-specific empty state
    const emptyState = EMPTY_STATES[selectedFolder] ?? EMPTY_STATES.default
    return (
      <div className={styles.empty}>
        <Icon name={emptyState.icon} size={ICON_SIZE.XLARGE} className={styles.emptyIcon} />
        <span className={styles.emptyTitle}>{emptyState.title}</span>
        <span className={styles.emptyDescription}>{emptyState.description}</span>
      </div>
    )
  }

  return (
    <div className={styles.list} role="grid" aria-label="Email list">
      {paginatedEmails.map((email) => (
        <EmailRow
          key={email.id}
          email={email}
          isSelected={isSelected(email.id)}
          threadCount={email.threadCount}
          onSelect={(shiftKey) => toggleSelection(email.id, shiftKey)}
          onOpen={() => handleOpenEmail(email.id)}
          onToggleStar={() => toggleStar(email.id)}
          onArchive={() => archiveEmails([email.id])}
          onDelete={() => deleteEmails([email.id])}
          onMarkRead={() =>
            email.isRead ? markUnread([email.id]) : markRead([email.id])
          }
        />
      ))}

      {/* Infinite scroll sentinel and loading indicator */}
      {hasMore && (
        <div ref={sentinelRef} className={styles.sentinel}>
          {isLoadingMore && (
            <div className={styles.loadingIndicator}>
              <span className={styles.loadMoreSpinner} />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* Pagination info */}
      {totalCount > EMAIL_LIST.PAGE_SIZE && (
        <div className={styles.paginationInfo}>
          Showing {paginatedEmails.length} of {totalCount} {conversationView ? 'conversations' : 'emails'}
        </div>
      )}
    </div>
  )
}
