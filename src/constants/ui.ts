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
