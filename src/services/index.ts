/**
 * Barrel export for services
 */

export { storage, STORAGE_KEYS, generateId } from './storage'
export type { StorageOptions, StorageKey } from './storage'

export {
  emailMatchesFilter,
  getFilterActions,
  applyFiltersToEmail,
  applyFiltersToEmails,
  isEmailBlocked,
  filterBlockedEmails,
  applyAllFilters,
} from './filterService'
export type { FilterActionResults } from './filterService'
