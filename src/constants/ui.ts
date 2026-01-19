/**
 * UI-related constants for consistent sizing and dimensions
 */

export const ICON_SIZE = {
  SMALL: 16,
  DEFAULT: 18,
  LARGE: 20,
} as const;

export const SVG_VIEWBOX = '0 0 24 24';

export const DRAGGABLE_BOUNDS = {
  /** Minimum visible width when dragging off-screen right */
  MIN_VISIBLE_WIDTH: 100,
  /** Minimum visible height when dragging off-screen bottom */
  MIN_VISIBLE_HEIGHT: 50,
  /** Maximum overflow allowed to the left */
  MAX_LEFT_OVERFLOW: 200,
} as const;

export const COMPOSE_WINDOW = {
  /** Default width for compose window */
  DEFAULT_WIDTH: 560,
  /** Default height for compose window */
  DEFAULT_HEIGHT: 460,
  /** Minimum width when resizing */
  MIN_WIDTH: 320,
  /** Minimum height when resizing */
  MIN_HEIGHT: 400,
  /** Maximum width as percentage of viewport */
  MAX_WIDTH_PERCENT: 0.75,
  /** Maximum height as percentage of viewport */
  MAX_HEIGHT_PERCENT: 0.75,
  /** Default offset from right edge */
  DEFAULT_RIGHT: 64,
  /** Default offset from bottom edge */
  DEFAULT_BOTTOM: 64,
  /** Width when minimized */
  MINIMIZED_WIDTH: 280,
} as const;

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
