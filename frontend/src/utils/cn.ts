/**
 * Utility for composing class names.
 * Filters out falsy values and joins with space.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
