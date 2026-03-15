import { describe, it, expect } from 'vitest'
import { cn } from '../cn'

describe('cn', () => {
  it('joins multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', false, 'bar', undefined, null, 'baz')).toBe('foo bar baz')
  })

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns empty string with only falsy values', () => {
    expect(cn(false, undefined, null)).toBe('')
  })

  it('handles single class', () => {
    expect(cn('only')).toBe('only')
  })
})
