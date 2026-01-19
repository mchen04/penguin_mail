/**
 * useNotifications - Hook for browser desktop notifications
 * Handles permission requests and notification display
 */

import { useState, useCallback } from 'react'
import { useSettings } from '@/context/SettingsContext'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type NotificationPermission = 'default' | 'granted' | 'denied'

interface UseNotificationsReturn {
  /** Current permission status */
  permission: NotificationPermission
  /** Whether notifications are supported by the browser */
  isSupported: boolean
  /** Whether notifications are enabled in settings and permission granted */
  isEnabled: boolean
  /** Request permission from the user */
  requestPermission: () => Promise<boolean>
  /** Show a notification */
  showNotification: (title: string, options?: NotificationOptions) => void
  /** Show notification for new email */
  notifyNewEmail: (from: string, subject: string, preview?: string) => void
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

// Get initial notification permission (safe for SSR)
function getInitialPermission(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission as NotificationPermission
  }
  return 'default'
}

export function useNotifications(): UseNotificationsReturn {
  const { notifications: settings, updateNotifications } = useSettings()
  const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission)

  const isSupported = typeof window !== 'undefined' && 'Notification' in window

  // Whether notifications are actually enabled (setting + permission)
  const isEnabled = isSupported &&
    settings.desktopNotifications &&
    permission === 'granted'

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result as NotificationPermission)

      // Update settings based on permission result
      if (result === 'granted') {
        updateNotifications({ desktopNotifications: true })
        return true
      } else {
        // If denied, disable in settings
        updateNotifications({ desktopNotifications: false })
        return false
      }
    } catch {
      return false
    }
  }, [isSupported, updateNotifications])

  const showNotification = useCallback((
    title: string,
    options?: NotificationOptions
  ) => {
    if (!isEnabled) return

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000)

      // Focus window on click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } catch (error) {
      console.warn('[useNotifications] Failed to show notification:', error)
    }
  }, [isEnabled])

  const notifyNewEmail = useCallback((
    from: string,
    subject: string,
    preview?: string
  ) => {
    if (!isEnabled || !settings.notifyOnNewEmail) return

    showNotification(`New email from ${from}`, {
      body: preview ? `${subject}\n${preview}` : subject,
      tag: 'new-email', // Prevents duplicate notifications
    })
  }, [isEnabled, settings.notifyOnNewEmail, showNotification])

  return {
    permission,
    isSupported,
    isEnabled,
    requestPermission,
    showNotification,
    notifyNewEmail,
  }
}

/**
 * Request notification permission on first interaction
 * Call this from a user-initiated event (button click, etc.)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  try {
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}
