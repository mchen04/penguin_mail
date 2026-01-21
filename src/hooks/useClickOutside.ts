/**
 * useClickOutside - Hook to detect clicks outside a referenced element
 * Useful for closing dropdowns, modals, and other overlay elements
 */

import { useEffect, type RefObject } from 'react'

/**
 * Calls the handler when a click occurs outside the referenced element
 * @param ref - React ref to the element to monitor
 * @param handler - Callback to invoke when clicking outside
 * @param enabled - Whether the listener is active (default: true)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler, enabled])
}
