/**
 * Recipient parsing utilities
 * Shared logic for parsing email recipient strings
 */

import type { EmailAddress } from '@/types/email'

/**
 * Parse a recipient string into an EmailAddress object
 * Handles formats like:
 * - "email@example.com"
 * - "Name <email@example.com>"
 */
export function parseRecipient(recipient: string): EmailAddress {
  const emailMatch = recipient.match(/<(.+)>/)
  if (emailMatch) {
    const name = recipient.replace(/<.+>/, '').trim()
    return { name, email: emailMatch[1] }
  }
  return { name: recipient.split('@')[0], email: recipient }
}

/**
 * Parse an array of recipient strings into EmailAddress objects
 */
export function parseRecipients(recipients: string[]): EmailAddress[] {
  return recipients.map(parseRecipient)
}

/**
 * Format an EmailAddress to a display string
 * Converts EmailAddress object to "Name <email>" or just "email" format
 */
export function formatRecipient(addr: EmailAddress): string {
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email
}

/**
 * Format an array of EmailAddress objects to display strings
 */
export function formatRecipients(addresses: EmailAddress[]): string[] {
  return addresses.map(formatRecipient)
}
