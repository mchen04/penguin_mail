/**
 * Date preset utilities for scheduling and snoozing
 * Shared logic used by ScheduleSendPicker and SnoozePicker
 */

export type DatePreset = 'laterToday' | 'tomorrow' | 'mondayMorning' | 'nextWeek' | 'nextMonth'

/**
 * Calculate a preset date based on the preset type
 */
export function getPresetDate(preset: DatePreset): Date {
  const now = new Date()
  const result = new Date(now)

  switch (preset) {
    case 'laterToday':
      // Set to 6 PM today, or 3 hours from now if after 3 PM
      result.setHours(18, 0, 0, 0)
      if (result <= now) {
        result.setTime(now.getTime() + 3 * 60 * 60 * 1000)
      }
      break
    case 'tomorrow':
      // Set to 8 AM tomorrow
      result.setDate(result.getDate() + 1)
      result.setHours(8, 0, 0, 0)
      break
    case 'mondayMorning': {
      // Set to 8 AM next Monday
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7
      result.setDate(result.getDate() + daysUntilMonday)
      result.setHours(8, 0, 0, 0)
      break
    }
    case 'nextWeek': {
      // Set to 8 AM next Monday (same as mondayMorning for snooze)
      const daysToMonday = (8 - now.getDay()) % 7 || 7
      result.setDate(result.getDate() + daysToMonday)
      result.setHours(8, 0, 0, 0)
      break
    }
    case 'nextMonth':
      // Set to 8 AM on the 1st of next month
      result.setMonth(result.getMonth() + 1, 1)
      result.setHours(8, 0, 0, 0)
      break
  }

  return result
}

/**
 * Format a preset date for display
 */
export function formatPresetDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
  return date.toLocaleString('en-US', options)
}

/**
 * Get tomorrow's date string in YYYY-MM-DD format for date inputs
 */
export function getTomorrowDateString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

/**
 * Get today's date string in YYYY-MM-DD format for date inputs
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Parse custom date/time inputs and create a Date object
 * Returns null if the date is invalid or in the past
 */
export function parseCustomDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null

  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)

  const scheduledDate = new Date(year, month - 1, day, hours, minutes)

  // Don't allow dates in the past
  if (scheduledDate <= new Date()) {
    return null
  }

  return scheduledDate
}
