import { describe, it, expect } from 'vitest'
import { parseRecipient, parseRecipients, formatRecipient, formatRecipients } from '../recipients'

describe('parseRecipient', () => {
  it('parses plain email', () => {
    const result = parseRecipient('user@example.com')
    expect(result.email).toBe('user@example.com')
    expect(result.name).toBe('user')
  })

  it('parses "Name <email>" format', () => {
    const result = parseRecipient('Alice Smith <alice@example.com>')
    expect(result.email).toBe('alice@example.com')
    expect(result.name).toBe('Alice Smith')
  })

  it('trims whitespace from name', () => {
    const result = parseRecipient('  Bob  <bob@example.com>')
    expect(result.name).toBe('Bob')
    expect(result.email).toBe('bob@example.com')
  })
})

describe('parseRecipients', () => {
  it('parses array of recipients', () => {
    const result = parseRecipients(['alice@example.com', 'Bob <bob@example.com>'])
    expect(result).toHaveLength(2)
    expect(result[0].email).toBe('alice@example.com')
    expect(result[1].name).toBe('Bob')
  })

  it('returns empty array for empty input', () => {
    expect(parseRecipients([])).toEqual([])
  })
})

describe('formatRecipient', () => {
  it('formats with name', () => {
    expect(formatRecipient({ name: 'Alice', email: 'alice@example.com' }))
      .toBe('Alice <alice@example.com>')
  })

  it('formats without name', () => {
    expect(formatRecipient({ name: '', email: 'alice@example.com' }))
      .toBe('alice@example.com')
  })
})

describe('formatRecipients', () => {
  it('formats array of addresses', () => {
    const result = formatRecipients([
      { name: 'Alice', email: 'alice@example.com' },
      { name: '', email: 'bob@example.com' },
    ])
    expect(result).toEqual(['Alice <alice@example.com>', 'bob@example.com'])
  })
})
