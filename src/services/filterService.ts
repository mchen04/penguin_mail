/**
 * Filter Service
 * Applies email filter rules to emails
 */

import type { Email, FolderType } from '@/types/email'
import type { FilterRule, FilterCondition, FilterAction, Settings } from '@/types/settings'

/**
 * Check if an email matches a single filter condition
 */
function matchesCondition(email: Email, condition: FilterCondition): boolean {
  const { field, operator, value } = condition
  const lowerValue = value.toLowerCase()

  let fieldValue = ''

  switch (field) {
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
      // For hasAttachment, value should be 'true' or 'false'
      return email.hasAttachment === (value.toLowerCase() === 'true')
    default:
      return false
  }

  switch (operator) {
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

/**
 * Check if an email matches a filter rule
 */
export function emailMatchesFilter(email: Email, filter: FilterRule): boolean {
  if (!filter.enabled || filter.conditions.length === 0) {
    return false
  }

  if (filter.matchAll) {
    // AND: all conditions must match
    return filter.conditions.every((condition) => matchesCondition(email, condition))
  } else {
    // OR: at least one condition must match
    return filter.conditions.some((condition) => matchesCondition(email, condition))
  }
}

/**
 * Results from applying filter actions
 */
export interface FilterActionResults {
  moveTo?: FolderType
  addLabels: string[]
  markAsRead: boolean
  markAsStarred: boolean
  delete: boolean
  archive: boolean
}

/**
 * Get the actions to apply for matching filters
 */
export function getFilterActions(actions: FilterAction[]): FilterActionResults {
  const results: FilterActionResults = {
    addLabels: [],
    markAsRead: false,
    markAsStarred: false,
    delete: false,
    archive: false,
  }

  for (const action of actions) {
    switch (action.type) {
      case 'moveTo':
        if (action.value) {
          results.moveTo = action.value as FolderType
        }
        break
      case 'addLabel':
        if (action.value) {
          results.addLabels.push(action.value)
        }
        break
      case 'markAsRead':
        results.markAsRead = true
        break
      case 'markAsStarred':
        results.markAsStarred = true
        break
      case 'delete':
        results.delete = true
        break
      case 'archive':
        results.archive = true
        break
    }
  }

  return results
}

/**
 * Apply all matching filters to an email and return the modified email
 */
export function applyFiltersToEmail(email: Email, filters: FilterRule[]): Email {
  const enabledFilters = filters.filter((f) => f.enabled)
  let modifiedEmail = { ...email }

  for (const filter of enabledFilters) {
    if (emailMatchesFilter(modifiedEmail, filter)) {
      const actions = getFilterActions(filter.actions)

      // Apply actions
      if (actions.delete) {
        modifiedEmail = { ...modifiedEmail, folder: 'trash' }
      } else if (actions.archive) {
        modifiedEmail = { ...modifiedEmail, folder: 'archive' }
      } else if (actions.moveTo) {
        modifiedEmail = { ...modifiedEmail, folder: actions.moveTo }
      }

      if (actions.markAsRead) {
        modifiedEmail = { ...modifiedEmail, isRead: true }
      }

      if (actions.markAsStarred) {
        modifiedEmail = { ...modifiedEmail, isStarred: true }
      }

      if (actions.addLabels.length > 0) {
        const existingLabels = modifiedEmail.labels || []
        modifiedEmail = {
          ...modifiedEmail,
          labels: [...new Set([...existingLabels, ...actions.addLabels])],
        }
      }
    }
  }

  return modifiedEmail
}

/**
 * Apply filters to multiple emails
 */
export function applyFiltersToEmails(emails: Email[], filters: FilterRule[]): Email[] {
  const enabledFilters = filters.filter((f) => f.enabled)
  if (enabledFilters.length === 0) return emails

  return emails.map((email) => applyFiltersToEmail(email, enabledFilters))
}

/**
 * Check if an email should be blocked based on blocked addresses
 */
export function isEmailBlocked(email: Email, blockedAddresses: string[]): boolean {
  const fromEmail = email.from.email.toLowerCase()
  return blockedAddresses.some((blocked) => fromEmail === blocked.toLowerCase())
}

/**
 * Apply blocked addresses filter to emails
 */
export function filterBlockedEmails(emails: Email[], blockedAddresses: string[]): Email[] {
  if (blockedAddresses.length === 0) return emails

  return emails.map((email) => {
    if (isEmailBlocked(email, blockedAddresses)) {
      return { ...email, folder: 'spam' as FolderType }
    }
    return email
  })
}

/**
 * Full filter application: blocked addresses + filter rules
 */
export function applyAllFilters(
  emails: Email[],
  settings: Pick<Settings, 'filters' | 'blockedAddresses'>
): Email[] {
  // First, apply blocked addresses
  let filtered = filterBlockedEmails(
    emails,
    settings.blockedAddresses.map((b) => b.email)
  )

  // Then apply filter rules
  filtered = applyFiltersToEmails(filtered, settings.filters)

  return filtered
}
