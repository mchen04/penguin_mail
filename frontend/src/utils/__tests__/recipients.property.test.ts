/**
 * Property-based tests for recipient parsing/formatting using fast-check.
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { parseRecipient, parseRecipients, formatRecipient, formatRecipients } from '../recipients'

// Arbitrary for a valid-looking email: localpart@domain.tld
const emailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
    fc.stringMatching(/^[a-z]{2,6}$/),
    fc.stringMatching(/^[a-z]{2,4}$/),
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

// Arbitrary for a display name (no angle brackets)
const nameArb = fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,20}$/)

describe('parseRecipient - property tests', () => {
  it('never throws for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(() => parseRecipient(s)).not.toThrow()
      }),
      { numRuns: 200 },
    )
  })

  it('result.email is either empty or contains "@"', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const { email } = parseRecipient(s)
        expect(typeof email).toBe('string')
        if (email !== '') {
          expect(email).toContain('@')
        }
      }),
      { numRuns: 200 },
    )
  })

  it('round-trip preserves email address for "Name <email>" format', () => {
    // formatRecipient({name, email}) → "Name <email>" → parseRecipient → {name, email}
    fc.assert(
      fc.property(nameArb, emailArb, (name, email) => {
        const formatted = formatRecipient({ name, email })
        const parsed = parseRecipient(formatted)
        expect(parsed.email).toBe(email)
      }),
      { numRuns: 200 },
    )
  })

  it('round-trip over an array preserves all email addresses', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(nameArb, emailArb).map(([name, email]) => ({ name, email })), {
          minLength: 1,
          maxLength: 10,
        }),
        (addresses) => {
          const formatted = formatRecipients(addresses)
          const parsed = parseRecipients(formatted)
          for (let i = 0; i < addresses.length; i++) {
            expect(parsed[i].email).toBe(addresses[i].email)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('formatRecipient output always includes the email address', () => {
    fc.assert(
      fc.property(nameArb, emailArb, (name, email) => {
        const result = formatRecipient({ name, email })
        expect(result).toContain(email)
      }),
      { numRuns: 200 },
    )
  })
})
