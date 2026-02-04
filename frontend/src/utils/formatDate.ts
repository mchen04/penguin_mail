/**
 * Format a date for display in the email list
 * - Today: shows time (e.g., "2:30 PM")
 * - This year: shows month and day (e.g., "Jan 5")
 * - Older: shows full date (e.g., "Jan 5, 2024")
 */
export function formatDate(date: Date): string {
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isThisYear = date.getFullYear() === now.getFullYear()

  if (isThisYear) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date for the email view header
 * Shows full date and time (e.g., "Jan 5, 2024, 2:30 PM")
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
