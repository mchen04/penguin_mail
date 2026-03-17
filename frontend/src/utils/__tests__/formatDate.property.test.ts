/**
 * Property-based tests for formatDate / formatFullDate using fast-check.
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { formatDate, formatFullDate } from '../formatDate'

// Valid Date timestamps: from year 2000 to year 2030
const timestampArb = fc.integer({
  min: new Date('2000-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
})

describe('formatDate - property tests', () => {
  it('always returns a non-empty string for any valid timestamp', () => {
    fc.assert(
      fc.property(timestampArb, (ts) => {
        const result = formatDate(new Date(ts))
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      }),
      { numRuns: 200 },
    )
  })

  it('never throws for dates in any year from 2000–2030', () => {
    fc.assert(
      fc.property(timestampArb, (ts) => {
        expect(() => formatDate(new Date(ts))).not.toThrow()
        expect(() => formatFullDate(new Date(ts))).not.toThrow()
      }),
      { numRuns: 200 },
    )
  })

  it('dates in the past (year < current year) always include a year', () => {
    // Any date from 2000–2019 is guaranteed to be in a past year
    const pastArb = fc.integer({
      min: new Date('2000-01-01').getTime(),
      max: new Date('2019-12-31').getTime(),
    })
    fc.assert(
      fc.property(pastArb, (ts) => {
        const result = formatDate(new Date(ts))
        // Past-year dates must include the 4-digit year (e.g. "Jan 5, 2018")
        expect(result).toMatch(/\d{4}/)
      }),
      { numRuns: 200 },
    )
  })

  it('formatFullDate always returns a non-empty string', () => {
    fc.assert(
      fc.property(timestampArb, (ts) => {
        const result = formatFullDate(new Date(ts))
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      }),
      { numRuns: 200 },
    )
  })

  it('edge case timestamps 0 and Date.now() do not throw', () => {
    expect(() => formatDate(new Date(0))).not.toThrow()
    expect(() => formatDate(new Date())).not.toThrow()
    expect(() => formatFullDate(new Date(0))).not.toThrow()
    expect(() => formatFullDate(new Date())).not.toThrow()
  })
})
