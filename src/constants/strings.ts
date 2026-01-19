/**
 * String constants for UI text, storage keys, and data attributes
 */

// Legacy storage keys (pre-repository pattern)
// New code should use STORAGE_KEYS from @/services/storage
export const LEGACY_STORAGE_KEYS = {
  THEME: 'theme',
  DENSITY: 'density',
  COMPOSE_SIZE: 'compose-size',
  COMPOSE_POSITION: 'compose-position',
} as const;

// Re-export for backwards compatibility
export { LEGACY_STORAGE_KEYS as STORAGE_KEYS };

export const DATA_ATTRIBUTES = {
  THEME: 'data-theme',
  DENSITY: 'data-density',
} as const;

export const PLACEHOLDERS = {
  SEARCH: 'Search mail',
  SUBJECT: 'Subject',
  COMPOSE_BODY: 'Compose your message...',
} as const;

export const LABELS = {
  CC: 'Cc',
  ALL_ACCOUNTS: 'All accounts',
} as const;
