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

/**
 * Hook that checks if a specific email matches any enabled filters
 * Returns the matching filter names
 */
export function useMatchingFilters(email: Email): string[] {
  const { filters } = useSettings()

  const matchingFilterNames = useMemo(() => {
    return filters
      .filter((f) => f.enabled)
      .filter((filter) => {
        if (filter.conditions.length === 0) return false

        const checkCondition = (condition: typeof filter.conditions[0]) => {
          const lowerValue = condition.value.toLowerCase()
          let fieldValue = ''

          switch (condition.field) {
            case 'from':
              fieldValue = `${email.from.name} ${email.from.email}`.toLowerCase()
              break
            case 'to':
              fieldValue = email.to.map((r) => `${r.name} ${r.email}`).join(' ').toLowerCase()
              break
            case 'subject':
              fieldValue = email.subject.toLowerCase()
              break
            case 'body':
              fieldValue = email.body.toLowerCase()
              break
            case 'hasAttachment':
              return email.hasAttachment === (condition.value.toLowerCase() === 'true')
            default:
              return false
          }

          switch (condition.operator) {
            case 'contains':
              return fieldValue.includes(lowerValue)
            case 'equals':
              return fieldValue === lowerValue
            case 'startsWith':
              return fieldValue.startsWith(lowerValue)
            case 'endsWith':
              return fieldValue.endsWith(lowerValue)
            case 'notContains':
              return !fieldValue.includes(lowerValue)
            default:
              return false
          }
        }

        if (filter.matchAll) {
          return filter.conditions.every(checkCondition)
        } else {
          return filter.conditions.some(checkCondition)
        }
      })
      .map((f) => f.name)
  }, [email, filters])

  return matchingFilterNames
}
