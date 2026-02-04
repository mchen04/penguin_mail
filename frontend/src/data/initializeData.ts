/**
 * Data initialization service
 * Populates localStorage with initial mock data on first load
 */

import { storage, STORAGE_KEYS } from '@/services/storage'
import { mockEmails } from './mockEmails'
import { mockAccounts } from './mockAccounts'
import { mockContacts, mockContactGroups } from './mockContacts'
import { createDefaultSettings } from '@/types/settings'

/**
 * Initialize all data stores with mock data
 * Only runs if data hasn't been initialized yet
 */
export async function initializeData(): Promise<void> {
  const isInitialized = await storage.has(STORAGE_KEYS.INITIALIZED, { simulateDelay: false })

  if (isInitialized) {
    return
  }

  // Initialize in parallel for better performance
  await Promise.all([
    storage.set(STORAGE_KEYS.EMAILS, mockEmails, { simulateDelay: false }),
    storage.set(STORAGE_KEYS.ACCOUNTS, mockAccounts, { simulateDelay: false }),
    storage.set(STORAGE_KEYS.CONTACTS, mockContacts, { simulateDelay: false }),
    storage.set(STORAGE_KEYS.CONTACT_GROUPS, mockContactGroups, { simulateDelay: false }),
    storage.set(STORAGE_KEYS.SETTINGS, createDefaultSettings(), { simulateDelay: false }),
    storage.set(STORAGE_KEYS.CUSTOM_FOLDERS, [], { simulateDelay: false }),
    storage.set(STORAGE_KEYS.LABELS, [
      { id: 'label-important', name: 'Important', color: '#ef4444' },
      { id: 'label-work', name: 'Work', color: '#3b82f6' },
      { id: 'label-personal', name: 'Personal', color: '#10b981' },
      { id: 'label-finance', name: 'Finance', color: '#f59e0b' },
      { id: 'label-travel', name: 'Travel', color: '#8b5cf6' },
    ], { simulateDelay: false }),
  ])

  // Mark as initialized
  await storage.set(STORAGE_KEYS.INITIALIZED, true, { simulateDelay: false })
}

/**
 * Reset all data to initial state
 */
export async function resetAllData(): Promise<void> {
  await storage.clear({ simulateDelay: false })
  await initializeData()
}

/**
 * Check if data has been initialized
 */
export async function isDataInitialized(): Promise<boolean> {
  return storage.has(STORAGE_KEYS.INITIALIZED, { simulateDelay: false })
}
