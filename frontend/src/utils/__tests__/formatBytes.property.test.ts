/**
 * Property-based tests for formatBytes using fast-check.
 *
 * Bug F1: formatBytes(NaN) / formatBytes(-1) / formatBytes(Infinity) return
 * garbage strings containing "NaN" or "undefined".
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { formatBytes } from '../formatBytes'

describe('formatBytes - property tests', () => {
  it('never returns a string containing "NaN"', () => {
    // fast-check generates a range of floats including NaN
    fc.assert(
      fc.property(fc.float({ noNaN: false }), (bytes) => {
        const result = formatBytes(bytes)
        // Bug F1: formatBytes(NaN) returns "NaN B" or similar
        expect(result).not.toContain('NaN')
      }),
      { numRuns: 200 },
    )
  })

  it('handles negative input without returning garbage', () => {
    fc.assert(
      fc.property(fc.integer({ max: -1 }), (bytes) => {
        const result = formatBytes(bytes)
        // Bug F1: formatBytes(-1) produces "-1 undefined" (sizes[-1] is undefined)
        expect(result).not.toContain('undefined')
        expect(result).not.toContain('NaN')
      }),
      { numRuns: 100 },
    )
  })

  it('handles Infinity without returning "undefined"', () => {
    // Bug F1: Math.floor(Math.log(Infinity)/Math.log(k)) = Infinity,
    // sizes[Infinity] = undefined
    const result = formatBytes(Infinity)
    expect(result).not.toContain('undefined')
    expect(result).not.toContain('NaN')
  })

  it('handles negative Infinity without returning "undefined"', () => {
    const result = formatBytes(-Infinity)
    expect(result).not.toContain('undefined')
    expect(result).not.toContain('NaN')
  })

  it('positive integers up to 1 TB always produce a result ending with a known unit', () => {
    // Cap at 1 TB (1024^4). Values > 1 PB overflow the sizes[] array (separate bug).
    const ONE_TB = 1_099_511_627_776
    const knownUnits = ['B', 'KB', 'MB', 'GB', 'TB']
    fc.assert(
      fc.property(fc.integer({ min: 1, max: ONE_TB }), (bytes) => {
        const result = formatBytes(bytes)
        const endsWithKnownUnit = knownUnits.some((unit) => result.endsWith(unit))
        expect(endsWithKnownUnit).toBe(true)
      }),
      { numRuns: 200 },
    )
  })

  it('zero returns "0 B"', () => {
    expect(formatBytes(0)).toBe('0 B')
  })
})
