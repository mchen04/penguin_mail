'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  /** Current theme setting ('light', 'dark', or 'system') */
  theme: Theme
  /** Resolved theme (always 'light' or 'dark', never 'system') */
  resolvedTheme: 'light' | 'dark'
  /** System's preferred color scheme */
  systemTheme: 'light' | 'dark'
  /** Update the theme */
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'penguin-mail-theme'

type ThemeProviderProps = {
  children: ReactNode
  /** Default theme if none is stored */
  defaultTheme?: Theme
}

/**
 * Theme Provider Component
 *
 * Provides theme management with:
 * - Light/Dark mode switching
 * - System preference detection
 * - LocalStorage persistence
 * - Smooth theme transitions
 *
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const resolvedTheme = theme === 'system' ? systemTheme : theme

    // Remove both classes first
    root.classList.remove('light', 'dark')

    // Add the resolved theme class
    root.classList.add(resolvedTheme)

    // Update color-scheme for better native element styling
    root.style.colorScheme = resolvedTheme
  }, [theme, systemTheme])

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }

  // Calculate resolved theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
