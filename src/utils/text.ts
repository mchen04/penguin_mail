/**
 * Text manipulation utilities
 */

/** Regex pattern to match HTML tags */
const HTML_TAG_REGEX = /<[^>]*>/g

/**
 * Strip HTML tags from a string
 * @param html - String potentially containing HTML tags
 * @param replacement - String to replace tags with (default: empty string)
 * @returns Plain text with HTML tags removed
 */
export function stripHtml(html: string, replacement = ''): string {
  return html.replace(HTML_TAG_REGEX, replacement)
}
