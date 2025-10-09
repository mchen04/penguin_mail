/**
 * Layout Constants for Penguin Mail
 *
 * Centralized layout dimensions and constraints used throughout the application.
 */

// =============================================================================
// SIDEBAR DIMENSIONS
// =============================================================================

export const sidebar = {
  /** Mobile sidebar width */
  widthMobile: '16rem', // 256px
  /** Tablet/Desktop sidebar width */
  widthDesktop: '18rem', // 288px (md:w-72)
  /** Wide screen sidebar width */
  widthWide: '20rem', // 320px
} as const

// =============================================================================
// EMAIL LIST DIMENSIONS
// =============================================================================

export const emailList = {
  /** Mobile/Tablet email list width (full width) */
  widthMobile: '100%',
  /** Desktop email list width */
  widthDesktop: '20rem', // 320px (md:w-80)
  /** Wide screen email list width */
  widthWide: '24rem', // 384px (lg:w-96)
} as const

// =============================================================================
// CONTENT WIDTHS (max-width constraints)
// =============================================================================

export const contentWidth = {
  /** Email preview content max-width */
  email: '48rem', // 768px (max-w-3xl)
  /** Modal content max-width */
  modal: '37.5rem', // 600px (sm:max-w-[600px])
  /** Form content max-width */
  form: '32rem', // 512px (max-w-lg)
  /** Wide content max-width */
  wide: '80rem', // 1280px (max-w-7xl)
  /** Ultra-wide max-width (prevent stretching on huge screens) */
  ultraWide: '120rem', // 1920px
} as const

// =============================================================================
// HEADER/APP BAR DIMENSIONS
// =============================================================================

export const header = {
  /** Mobile header height */
  heightMobile: '3.5rem', // 56px
  /** Desktop header height */
  heightDesktop: '4rem', // 64px
} as const

// =============================================================================
// CARD DIMENSIONS
// =============================================================================

export const card = {
  /** Email list item padding (mobile) */
  paddingMobile: '0.75rem', // 12px (p-3)
  /** Email list item padding (desktop) */
  paddingDesktop: '1rem', // 16px (p-4)
  /** Card border radius */
  radius: '0.5rem', // 8px
} as const

// =============================================================================
// AVATAR DIMENSIONS
// =============================================================================

export const avatar = {
  /** Small avatar size */
  sm: '2rem', // 32px (h-8 w-8)
  /** Medium avatar size */
  md: '2.5rem', // 40px (h-10 w-10)
  /** Large avatar size */
  lg: '3rem', // 48px (h-12 w-12)
  /** Extra large avatar size */
  xl: '4rem', // 64px (h-16 w-16)
} as const

// =============================================================================
// ICON DIMENSIONS
// =============================================================================

export const icon = {
  /** Extra small icon size */
  xs: '0.75rem', // 12px (h-3 w-3)
  /** Small icon size */
  sm: '1rem', // 16px (h-4 w-4)
  /** Medium icon size */
  md: '1.25rem', // 20px (h-5 w-5)
  /** Large icon size */
  lg: '1.5rem', // 24px (h-6 w-6)
  /** Extra large icon size */
  xl: '2rem', // 32px (h-8 w-8)
} as const

// =============================================================================
// BADGE DIMENSIONS
// =============================================================================

export const badge = {
  /** Unread indicator badge size */
  unread: '0.5rem', // 8px (h-2 w-2)
  /** Small badge size */
  sm: '1.25rem', // 20px
  /** Medium badge size */
  md: '1.5rem', // 24px
} as const

// =============================================================================
// Z-INDEX LAYERS (application-specific)
// =============================================================================

export const zIndex = {
  /** Mobile sidebar overlay backdrop */
  sidebarBackdrop: 40,
  /** Mobile sidebar panel */
  sidebar: 50,
  /** Compose modal backdrop */
  modalBackdrop: 100,
  /** Compose modal dialog */
  modal: 110,
  /** Dropdown menus */
  dropdown: 120,
  /** Tooltips */
  tooltip: 130,
  /** Toast notifications */
  toast: 140,
} as const

// =============================================================================
// ANIMATION DURATIONS (application-specific)
// =============================================================================

export const animation = {
  /** Sidebar slide animation */
  sidebarSlide: '300ms',
  /** Modal fade animation */
  modalFade: '200ms',
  /** Dropdown slide animation */
  dropdownSlide: '150ms',
  /** Hover state transition */
  hover: '150ms',
  /** Focus state transition */
  focus: '200ms',
} as const

// =============================================================================
// SCROLL BEHAVIOR
// =============================================================================

export const scroll = {
  /** Email list scroll padding */
  padding: '1rem',
  /** Smooth scroll behavior */
  behavior: 'smooth' as const,
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SidebarWidth = keyof typeof sidebar
export type EmailListWidth = keyof typeof emailList
export type ContentWidth = keyof typeof contentWidth
export type AvatarSize = keyof typeof avatar
export type IconSize = keyof typeof icon
