/**
 * Text processing utilities
 */

/**
 * Remove HTML tags from a string
 * Used for generating plain text previews of HTML content
 * @param html - The HTML string to strip
 * @param separator - Optional separator to use between text nodes (default: '')
 */
export function stripHtml(html: string, separator = ''): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (separator) {
    return doc.body.textContent?.replace(/\s+/g, separator).trim() || ''
  }
  return doc.body.textContent || ''
}
