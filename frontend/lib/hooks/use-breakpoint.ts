'use client'

import { useState, useEffect } from 'react'
import { breakpoints, type Breakpoint } from '@/lib/theme/breakpoints'

type BreakpointState = {
  /** Current active breakpoint */
  current: Breakpoint | 'xs'
  /** Check if viewport is mobile-sized (< sm) */
  isMobile: boolean
  /** Check if viewport is tablet-sized (sm - md) */
  isTablet: boolean
  /** Check if viewport is desktop-sized (>= md) */
  isDesktop: boolean
  /** Check if viewport is wide desktop (>= lg) */
  isWide: boolean
  /** Check if viewport is at or above a specific breakpoint */
  isAbove: (breakpoint: Breakpoint) => boolean
  /** Check if viewport is below a specific breakpoint */
  isBelow: (breakpoint: Breakpoint) => boolean
}

/**
 * Custom hook for responsive breakpoint detection
 *
 * Returns information about the current viewport size and helper functions
 * for responsive conditional rendering.
 *
 * @returns BreakpointState object with current breakpoint and helper functions
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { isMobile, isDesktop, isAbove } = useBreakpoint()
 *
 *   if (isMobile) {
 *     return <MobileView />
 *   }
 *
 *   if (isAbove('lg')) {
 *     return <WideView />
 *   }
 *
 *   return <DesktopView />
 * }
 * ```
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    // Server-side rendering safe defaults
    if (typeof window === 'undefined') {
      return {
        current: 'xs',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false,
        isAbove: () => false,
        isBelow: () => false,
      }
    }

    return getBreakpointState()
  })

  useEffect(() => {
    // Initial state
    setState(getBreakpointState())

    // Update on resize
    const handleResize = () => {
      setState(getBreakpointState())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return state
}

/**
 * Helper function to determine current breakpoint state
 */
function getBreakpointState(): BreakpointState {
  const width = window.innerWidth

  // Determine current breakpoint
  let current: Breakpoint | 'xs' = 'xs'
  if (width >= breakpoints.xl) current = 'xl'
  else if (width >= breakpoints.lg) current = 'lg'
  else if (width >= breakpoints.md) current = 'md'
  else if (width >= breakpoints.sm) current = 'sm'

  // Helper flags
  const isMobile = width < breakpoints.sm
  const isTablet = width >= breakpoints.sm && width < breakpoints.md
  const isDesktop = width >= breakpoints.md
  const isWide = width >= breakpoints.lg

  // Helper functions
  const isAbove = (breakpoint: Breakpoint): boolean => {
    return width >= breakpoints[breakpoint]
  }

  const isBelow = (breakpoint: Breakpoint): boolean => {
    return width < breakpoints[breakpoint]
  }

  return {
    current,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isAbove,
    isBelow,
  }
}
