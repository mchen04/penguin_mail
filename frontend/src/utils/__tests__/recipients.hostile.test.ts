/**
 * Hostile input tests for parseRecipient.
 *
 * Bug F2: parseRecipient has no validation — inputs lacking "@" produce an
 * EmailAddress where the email field does not contain "@".
 */

import { describe, expect, it } from 'vitest'
import { parseRecipient } from '../recipients'

describe('parseRecipient - hostile inputs', () => {
  it('no @ sign — email field is empty string (Bug F2)', () => {
    // Bug F2: parseRecipient('notanemail') returns { email: 'notanemail' } which
    // is not a valid email. After the fix, email should be '' to signal invalid.
    const result = parseRecipient('notanemail')
    expect(result.email).toBe('')
  })

  it('empty string — does not throw', () => {
    expect(() => parseRecipient('')).not.toThrow()
  })

  it('empty angle brackets <> — handled gracefully without throwing', () => {
    // "<>" matches /<(.+)>/ with a one-char minimum, but "<>" has empty content.
    // With the regex /<(.+)>/ the match fails (+ requires ≥1 char).
    expect(() => parseRecipient('<>')).not.toThrow()
    const result = parseRecipient('<>')
    // The result must be a valid object, not undefined/null
    expect(result).toBeDefined()
    expect(typeof result.email).toBe('string')
  })

  it('<notanemail> — email field is empty string when no @ present (Bug F2)', () => {
    // Angle-bracket form with no @ inside — the extracted string is not a valid email.
    // After the fix, email should be '' to signal invalid.
    const result = parseRecipient('<notanemail>')
    expect(result.email).toBe('')
  })

  it('RTL override character in name — email address part stays intact', () => {
    // \u202E is RIGHT-TO-LEFT OVERRIDE — a hostile Unicode character
    const result = parseRecipient('\u202EEvil Name\u202C <real@example.com>')
    expect(result.email).toBe('real@example.com')
  })

  it('multiple angle brackets — does not throw', () => {
    expect(() => parseRecipient('<<double@example.com>>')).not.toThrow()
  })

  it('only spaces — does not throw and returns an object', () => {
    expect(() => parseRecipient('   ')).not.toThrow()
    const result = parseRecipient('   ')
    expect(result).toBeDefined()
  })

  it('very long string — does not throw', () => {
    const long = 'a'.repeat(10_000) + '@example.com'
    expect(() => parseRecipient(long)).not.toThrow()
  })
})
