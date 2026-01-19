/**
 * Storage Service
 * Provides localStorage persistence with JSON serialization and simulated delays
 */

import { STORAGE_SIMULATION, RANDOM_ID } from '@/constants'

const STORAGE_PREFIX = 'penguin_mail_'

export interface StorageOptions {
  simulateDelay?: boolean
  minDelay?: number
  maxDelay?: number
}

const defaultOptions: StorageOptions = {
  simulateDelay: true,
  minDelay: STORAGE_SIMULATION.MIN_DELAY,
  maxDelay: STORAGE_SIMULATION.MAX_DELAY,
}

/**
 * Simulates network delay for realistic UX
 */
async function delay(options: StorageOptions = defaultOptions): Promise<void> {
  if (!options.simulateDelay) return

  const min = options.minDelay ?? STORAGE_SIMULATION.MIN_DELAY
  const max = options.maxDelay ?? STORAGE_SIMULATION.MAX_DELAY
  const ms = Math.floor(Math.random() * (max - min + 1)) + min

  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(RANDOM_ID.SLICE_START, RANDOM_ID.SLICE_END_LONG)}`
}

/**
 * Get prefixed key
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

/**
 * Custom JSON reviver to handle Date objects
 */
function reviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    // Check if string is an ISO date format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
    if (isoDateRegex.test(value)) {
      return new Date(value)
    }
  }
  return value
}

/**
 * Custom JSON replacer to handle Date objects
 */
function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString()
  }
  return value
}

/**
 * Storage service with typed get/set operations
 */
export const storage = {
  /**
   * Get item from storage
   */
  async get<T>(key: string, options: StorageOptions = defaultOptions): Promise<T | null> {
    await delay(options)

    try {
      const item = localStorage.getItem(getKey(key))
      if (item === null) return null
      return JSON.parse(item, reviver) as T
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error)
      return null
    }
  },

  /**
   * Set item in storage
   */
  async set<T>(key: string, value: T, options: StorageOptions = defaultOptions): Promise<void> {
    await delay(options)

    try {
      const serialized = JSON.stringify(value, replacer)
      localStorage.setItem(getKey(key), serialized)
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error)
      throw new Error(`Failed to save to storage: ${key}`)
    }
  },

  /**
   * Remove item from storage
   */
  async remove(key: string, options: StorageOptions = defaultOptions): Promise<void> {
    await delay(options)

    try {
      localStorage.removeItem(getKey(key))
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error)
    }
  },

  /**
   * Clear all app storage
   */
  async clear(options: StorageOptions = defaultOptions): Promise<void> {
    await delay(options)

    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing storage', error)
    }
  },

  /**
   * Check if key exists
   */
  async has(key: string, options: StorageOptions = defaultOptions): Promise<boolean> {
    await delay(options)
    return localStorage.getItem(getKey(key)) !== null
  },

  /**
   * Get all keys with prefix
   */
  async keys(options: StorageOptions = defaultOptions): Promise<string[]> {
    await delay(options)

    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''))
      }
    }
    return keys
  },

  /**
   * Get or set with default value
   */
  async getOrSet<T>(
    key: string,
    defaultValue: T | (() => T),
    options: StorageOptions = defaultOptions
  ): Promise<T> {
    const existing = await this.get<T>(key, options)
    if (existing !== null) return existing

    const value = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue
    await this.set(key, value, options)
    return value
  },

  /**
   * Update a value with a function
   */
  async update<T>(
    key: string,
    updater: (current: T | null) => T,
    options: StorageOptions = defaultOptions
  ): Promise<T> {
    const current = await this.get<T>(key, options)
    const updated = updater(current)
    await this.set(key, updated, { ...options, simulateDelay: false })
    return updated
  },
}

/**
 * Storage keys used by the application
 */
export const STORAGE_KEYS = {
  EMAILS: 'emails',
  ACCOUNTS: 'accounts',
  CONTACTS: 'contacts',
  CONTACT_GROUPS: 'contact_groups',
  CUSTOM_FOLDERS: 'custom_folders',
  LABELS: 'labels',
  SETTINGS: 'settings',
  THEME: 'theme',
  DENSITY: 'density',
  DRAFTS: 'drafts',
  INITIALIZED: 'initialized',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
