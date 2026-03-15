import { describe, it, expect } from 'vitest'
import { formatDate, formatFullDate } from '../formatDate'

describe('formatDate', () => {
  it('shows time for today', () => {
    const now = new Date()
    now.setHours(14, 30, 0, 0)
    const result = formatDate(now)
    // Should contain time components like "2:30 PM"
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
  })

  it('shows month and day for this year', () => {
    const date = new Date()
    date.setMonth(0, 5) // Jan 5
    date.setFullYear(new Date().getFullYear())
    // Move to a different day so it's not "today"
    const today = new Date()
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth()) {
      date.setDate(date.getDate() - 1)
    }
    const result = formatDate(date)
    expect(result).toMatch(/[A-Z][a-z]+\s\d{1,2}/i)
    expect(result).not.toMatch(/\d{4}/) // No year
  })

  it('shows full date with year for older dates', () => {
    const date = new Date(2020, 0, 5) // Jan 5, 2020
    const result = formatDate(date)
    expect(result).toMatch(/2020/)
  })
})

describe('formatFullDate', () => {
  it('includes date and time', () => {
    const date = new Date(2024, 0, 5, 14, 30)
    const result = formatFullDate(date)
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/5/)
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})
