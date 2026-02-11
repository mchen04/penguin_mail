/**
 * Storage Service
 * Provides localStorage persistence with JSON serialization
 */

import { RANDOM_ID } from '@/constants'

const STORAGE_PREFIX = 'penguin_mail_'

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
  async get<T>(key: string): Promise<T | null> {
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
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value, replacer)
      localStorage.setItem(getKey(key), serialized)
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error)
      throw new Error(`Failed to save to storage: ${key}`)
    }
  },

  /**
   * Clear all app storage
   */
  async clear(): Promise<void> {
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
  async has(key: string): Promise<boolean> {
    return localStorage.getItem(getKey(key)) !== null
  },
}

/**
 * Storage keys used by the application
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  DENSITY: 'density',
  SAVED_SEARCHES: 'saved_searches',
  EMAIL_TEMPLATES: 'email_templates',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
