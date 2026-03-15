import { describe, it, expect } from 'vitest'
import { stripHtml } from '../text'

describe('stripHtml', () => {
  it('strips basic HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello')
  })

  it('strips nested tags', () => {
    expect(stripHtml('<div><p>Hello <b>World</b></p></div>')).toBe('Hello World')
  })

  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('')
  })

  it('handles plain text (no tags)', () => {
    expect(stripHtml('Just text')).toBe('Just text')
  })

  it('uses separator to collapse whitespace', () => {
    const result = stripHtml('<p>Hello   World</p>', ' ')
    expect(result).toBe('Hello World')
  })
})
