/**
 * UI-related constants for consistent sizing and dimensions
 */

export const ICON_SIZE = {
  /** Extra small icons (14px) - chevrons, inline edit buttons */
  XSMALL: 14,
  /** Small icons (16px) - most toolbar and inline icons */
  SMALL: 16,
  /** Default icons (18px) - standard action icons */
  DEFAULT: 18,
  /** Large icons (20px) - primary action icons */
  LARGE: 20,
  /** Medium-large icons (24px) - modal icons, lightbox close */
  MEDIUM_LARGE: 24,
  /** Extra-medium icons (32px) - drag area icons */
  MEDIUM_XLARGE: 32,
  /** Extra large icons (48px) - empty state illustrations */
  XLARGE: 48,
} as const;

export const SVG_VIEWBOX = '0 0 24 24';


export const EMAIL_LIST = {
  /** Number of emails to load per page */
  PAGE_SIZE: 25,
  /** Number of skeleton rows to show while loading */
  SKELETON_COUNT: 8,
  /** Root margin for infinite scroll observer */
  INFINITE_SCROLL_ROOT_MARGIN: '100px',
  /** Delay in ms for load more animation */
  LOAD_MORE_DELAY: 300,
  /** Maximum labels to show in list view */
  MAX_LABELS_DISPLAY: 3,
  /** Skeleton line widths for loading state */
  SKELETON_LINE_WIDTHS: ['30%', '60%', '80%'] as const,
} as const;

export const DATE_RANGE_MS = {
  /** Milliseconds in a day */
  DAY: 24 * 60 * 60 * 1000,
  /** Milliseconds in a week */
  WEEK: 7 * 24 * 60 * 60 * 1000,
  /** Milliseconds in a month (30 days) */
  MONTH: 30 * 24 * 60 * 60 * 1000,
  /** Milliseconds in a year (365 days) */
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

export const REPOSITORY = {
  /** Page size for loading all emails */
  LOAD_ALL_PAGE_SIZE: 10000,
} as const;

/** Available colors for labels */
export const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
] as const;

export type LabelColor = typeof LABEL_COLORS[number];

/** Available colors for custom folders */
export const FOLDER_COLORS = [
  '#64748b', // slate
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
] as const;

export type FolderColor = typeof FOLDER_COLORS[number];

export const TOAST = {
  /** Default duration for toast notifications in ms */
  DEFAULT_DURATION: 5000,
  /** Duration for error toast notifications in ms */
  ERROR_DURATION: 8000,
} as const;

export const STORAGE_SIMULATION = {
  /** Minimum simulated delay in ms */
  MIN_DELAY: 50,
  /** Maximum simulated delay in ms */
  MAX_DELAY: 200,
} as const;

export const TEXT = {
  /** Maximum length for email preview text */
  EMAIL_PREVIEW_LENGTH: 100,
  /** Maximum length for signature preview in settings */
  SIGNATURE_PREVIEW_LENGTH: 50,
} as const;

export const RECIPIENT_FIELD = {
  /** Maximum number of contact suggestions to show */
  MAX_SUGGESTIONS: 5,
} as const;

export const RANDOM_ID = {
  /** Start index for random string slicing */
  SLICE_START: 2,
  /** End index for random string slicing (long IDs) */
  SLICE_END_LONG: 11,
  /** End index for random string slicing (short IDs) */
  SLICE_END_SHORT: 9,
} as const;

export const UNDO_STACK = {
  /** Default time in ms before undo expires */
  DEFAULT_EXPIRE_TIME: 10000,
  /** Default maximum stack size */
  DEFAULT_MAX_SIZE: 10,
} as const;

export const BYTES = {
  /** Bytes per kilobyte */
  PER_KB: 1024,
  /** Bytes per megabyte */
  PER_MB: 1024 * 1024,
} as const;

export const SIMULATED_DELAY = {
  /** Base delay for standard operations in ms */
  BASE_MS: 200,
  /** Variance for standard operations in ms */
  VARIANCE: 100,
  /** Fast delay base in ms */
  FAST_BASE_MS: 50,
  /** Fast delay variance in ms */
  FAST_VARIANCE: 100,
  /** Slow delay base in ms */
  SLOW_BASE_MS: 300,
  /** Slow delay variance in ms */
  SLOW_VARIANCE: 200,
  /** Probability of slow response (0-1) */
  SLOW_CHANCE: 0.1,
} as const;

export const NOTIFICATION = {
  /** Time before notification auto-closes in ms */
  AUTO_CLOSE_DELAY: 5000,
} as const;

export const AUTO_SAVE = {
  /** Time before auto-save status resets to idle in ms */
  STATUS_RESET_DELAY: 2000,
  /** Interval between auto-save checks in ms */
  INTERVAL: 30000,
} as const;
