/**
 * useFilteredEmails hook
 * Applies email filters and blocked addresses to emails
 */

import { useMemo } from 'react'
import type { Email } from '@/types/email'
import { useSettings } from '@/context/SettingsContext'
import { applyAllFilters } from '@/services/filterService'

/**
 * Hook that applies filter rules and blocked addresses to a list of emails
 * Returns emails with filters applied
 */
export function useFilteredEmails(emails: Email[]): Email[] {
  const { filters, blockedAddresses } = useSettings()

  const filteredEmails = useMemo(() => {
    return applyAllFilters(emails, {
      filters,
      blockedAddresses: blockedAddresses.map((email) => ({ id: '', email, createdAt: new Date() })),
    })
  }, [emails, filters, blockedAddresses])

  return filteredEmails
}
