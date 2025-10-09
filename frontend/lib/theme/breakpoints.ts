/**
 * Responsive Breakpoints for Penguin Mail
 *
 * Mobile-first breakpoint system following 2025 best practices.
 * Based on content needs rather than device-specific sizes.
 */

// =============================================================================
// BREAKPOINT VALUES (in pixels)
// =============================================================================

export const breakpoints = {
  /** Small devices (mobile) - 0-640px */
  sm: 640,
  /** Medium devices (tablet) - 641-1024px */
  md: 1024,
  /** Large devices (laptop/desktop) - 1025-1440px */
  lg: 1440,
  /** Extra large devices (wide desktop) - 1441px+ */
  xl: 1920,
} as const

// =============================================================================
// MEDIA QUERIES (for use in CSS-in-JS or styled components)
// =============================================================================

export const mediaQueries = {
  /** @media (min-width: 640px) */
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  /** @media (min-width: 1024px) */
  md: `@media (min-width: ${breakpoints.md}px)`,
  /** @media (min-width: 1440px) */
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  /** @media (min-width: 1920px) */
  xl: `@media (min-width: ${breakpoints.xl}px)`,
} as const

// =============================================================================
// RANGE QUERIES (for specific ranges)
// =============================================================================

export const mediaRanges = {
  /** Mobile only: 0-639px */
  mobileOnly: `@media (max-width: ${breakpoints.sm - 1}px)`,
  /** Tablet only: 640-1023px */
  tabletOnly: `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  /** Desktop only: 1024-1439px */
  desktopOnly: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  /** Wide only: 1440px+ */
  wideOnly: `@media (min-width: ${breakpoints.lg}px)`,

  /** Mobile & Tablet: 0-1023px */
  belowDesktop: `@media (max-width: ${breakpoints.md - 1}px)`,
  /** Tablet & Desktop: 640px+ */
  aboveMobile: `@media (min-width: ${breakpoints.sm}px)`,
} as const

// =============================================================================
// TAILWIND CLASS PREFIXES (for documentation)
// =============================================================================

/**
 * Tailwind CSS breakpoint prefixes:
 * - Default (no prefix): Mobile-first (0px+)
 * - sm: ≥640px
 * - md: ≥1024px
 * - lg: ≥1440px
 * - xl: ≥1920px
 *
 * Example usage:
 * - `text-sm md:text-base lg:text-lg` - Responsive typography
 * - `hidden md:block` - Show on desktop, hide on mobile
 * - `p-4 md:p-6 lg:p-8` - Responsive padding
 */

// =============================================================================
// CONTAINER QUERIES
// =============================================================================

export const containerQueries = {
  /** @container (min-width: 320px) */
  xs: '@container (min-width: 320px)',
  /** @container (min-width: 480px) */
  sm: '@container (min-width: 480px)',
  /** @container (min-width: 640px) */
  md: '@container (min-width: 640px)',
  /** @container (min-width: 768px) */
  lg: '@container (min-width: 768px)',
  /** @container (min-width: 1024px) */
  xl: '@container (min-width: 1024px)',
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Breakpoint = keyof typeof breakpoints
export type MediaQuery = keyof typeof mediaQueries
export type MediaRange = keyof typeof mediaRanges

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if current window width matches a breakpoint
 * @param breakpoint - The breakpoint to check
 * @returns boolean
 */
export function isBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= breakpoints[breakpoint]
}

/**
 * Get the current active breakpoint
 * @returns The current breakpoint name
 */
export function getCurrentBreakpoint(): Breakpoint | 'xs' {
  if (typeof window === 'undefined') return 'xs'

  const width = window.innerWidth

  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

/**
 * Check if the viewport is mobile-sized (below tablet breakpoint)
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoints.sm
}

/**
 * Check if the viewport is tablet-sized
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= breakpoints.sm && width < breakpoints.md
}

/**
 * Check if the viewport is desktop-sized or larger
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= breakpoints.md
}
