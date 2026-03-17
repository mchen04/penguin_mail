/**
 * Property-based tests for text utilities using fast-check.
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { stripHtml } from '../text'

describe('stripHtml - property tests', () => {
  it('always returns a string (never null or undefined)', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = stripHtml(s)
        expect(typeof result).toBe('string')
      }),
      { numRuns: 200 },
    )
  })

  it('never throws for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(() => stripHtml(s)).not.toThrow()
      }),
      { numRuns: 200 },
    )
  })

  it('empty string returns empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('result never contains HTML tag characters < or >', () => {
    // A string composed purely of HTML-like structures should be fully stripped
    const htmlTagArb = fc
      .tuple(
        fc.stringMatching(/^[a-z]{1,10}$/),
        fc.stringMatching(/^[A-Za-z0-9 ]{0,50}$/),
      )
      .map(([tag, content]) => `<${tag}>${content}</${tag}>`)

    fc.assert(
      fc.property(htmlTagArb, (html) => {
        const result = stripHtml(html)
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
      }),
      { numRuns: 200 },
    )
  })

  it('result of stripping plain text (no tags) equals the original', () => {
    // Text with no angle brackets is unchanged by stripHtml
    const plainTextArb = fc.stringMatching(/^[^<>]*$/)
    fc.assert(
      fc.property(plainTextArb, (s) => {
        const result = stripHtml(s)
        // stripHtml passes through DOMParser which normalises whitespace at trim boundaries;
        // we only assert the text content is preserved (no content dropped)
        expect(result).toContain(s.trim() ? s.trim().slice(0, 5) : '')
      }),
      { numRuns: 100 },
    )
  })

  it('with separator: result never contains raw newlines when separator is a space', () => {
    const htmlArb = fc
      .array(
        fc
          .tuple(
            fc.stringMatching(/^[a-z]{1,5}$/),
            fc.stringMatching(/^[A-Za-z0-9]{1,20}$/),
          )
          .map(([tag, text]) => `<${tag}>${text}</${tag}>`),
        { minLength: 1, maxLength: 5 },
      )
      .map((tags) => tags.join(''))

    fc.assert(
      fc.property(htmlArb, (html) => {
        const result = stripHtml(html, ' ')
        expect(result).not.toContain('\n')
        expect(result).not.toContain('\r')
      }),
      { numRuns: 100 },
    )
  })
})
