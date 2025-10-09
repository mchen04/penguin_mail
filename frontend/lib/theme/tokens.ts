/**
 * Design Tokens for Penguin Mail
 *
 * Centralized design system tokens following 2025 best practices.
 * Uses 4px/8px spacing scale and semantic naming conventions.
 */

// =============================================================================
// SPACING SCALE (based on 4px/8px grid)
// =============================================================================

export const spacing = {
  /** 2px - Micro spacing for tight layouts */
  '3xs': '0.125rem',
  /** 4px - Extra extra small spacing */
  '2xs': '0.25rem',
  /** 8px - Extra small spacing */
  xs: '0.5rem',
  /** 12px - Small spacing */
  sm: '0.75rem',
  /** 16px - Medium spacing (base unit) */
  md: '1rem',
  /** 20px - Medium-large spacing */
  lg: '1.25rem',
  /** 24px - Large spacing */
  xl: '1.5rem',
  /** 32px - Extra large spacing */
  '2xl': '2rem',
  /** 40px - Extra extra large spacing */
  '3xl': '2.5rem',
  /** 48px - Huge spacing */
  '4xl': '3rem',
  /** 64px - Extra huge spacing */
  '5xl': '4rem',
} as const

// =============================================================================
// TYPOGRAPHY SCALE
// =============================================================================

export const fontSize = {
  /** 10px - Caption/metadata text */
  '2xs': '0.625rem',
  /** 12px - Small text */
  xs: '0.75rem',
  /** 14px - Body small text */
  sm: '0.875rem',
  /** 16px - Base body text */
  base: '1rem',
  /** 18px - Large body text */
  lg: '1.125rem',
  /** 20px - Extra large text */
  xl: '1.25rem',
  /** 24px - Heading 4 */
  '2xl': '1.5rem',
  /** 30px - Heading 3 */
  '3xl': '1.875rem',
  /** 36px - Heading 2 */
  '4xl': '2.25rem',
  /** 48px - Heading 1 */
  '5xl': '3rem',
} as const

export const lineHeight = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

// =============================================================================
// SEMANTIC TYPOGRAPHY STYLES
// =============================================================================

export const typography = {
  // Headings
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  h2: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  h3: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },
  h4: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },

  // Body text
  'body-lg': {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.relaxed,
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.normal,
  },
  'body-sm': {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
  },

  // UI text
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.snug,
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.normal,
  },
  metadata: {
    fontSize: fontSize['2xs'],
    lineHeight: lineHeight.tight,
  },
} as const

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.625rem',  // 10px (matches --radius from globals.css)
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
} as const

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transition = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const

export const transitionTimingFunction = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// =============================================================================
// SHADOWS
// =============================================================================

export const boxShadow = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

// =============================================================================
// TOUCH TARGETS (minimum sizes for mobile accessibility)
// =============================================================================

export const touchTarget = {
  /** Minimum touch target size (44x44px per iOS/Android guidelines) */
  min: '2.75rem',
  /** Comfortable touch target size */
  comfortable: '3rem',
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Spacing = keyof typeof spacing
export type FontSize = keyof typeof fontSize
export type Typography = keyof typeof typography
export type BorderRadius = keyof typeof borderRadius
export type ZIndex = keyof typeof zIndex
