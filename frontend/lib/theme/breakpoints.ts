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
// TYPE EXPORTS
// =============================================================================

export type Breakpoint = keyof typeof breakpoints
