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
  DEFAULT_WIDTH: 600,
  /** Default height for compose window */
  DEFAULT_HEIGHT: 500,
  /** Minimum width when resizing */
  MIN_WIDTH: 320,
  /** Minimum height when resizing */
  MIN_HEIGHT: 400,
  /** Maximum width as percentage of viewport */
  MAX_WIDTH_PERCENT: 0.9,
  /** Maximum height as percentage of viewport */
  MAX_HEIGHT_PERCENT: 0.9,
  /** Default offset from right edge */
  DEFAULT_RIGHT: 16,
  /** Default offset from bottom edge */
  DEFAULT_BOTTOM: 16,
  /** Width when minimized */
  MINIMIZED_WIDTH: 280,
} as const;
