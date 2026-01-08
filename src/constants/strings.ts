/**
 * String constants for UI text, storage keys, and data attributes
 */

export const STORAGE_KEYS = {
  THEME: 'theme',
  DENSITY: 'density',
} as const;

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
