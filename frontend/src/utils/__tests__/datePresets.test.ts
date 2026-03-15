import { describe, it, expect } from 'vitest'
import {
  getPresetDate,
  formatPresetDate,
  getTomorrowDateString,
  getTodayDateString,
  parseCustomDateTime,
} from '../datePresets'

describe('getPresetDate', () => {
  it('laterToday returns a future date today', () => {
    const result = getPresetDate('laterToday')
    expect(result.getTime()).toBeGreaterThan(Date.now())
  })

  it('tomorrow returns 8 AM tomorrow', () => {
    const result = getPresetDate('tomorrow')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(result.getDate()).toBe(tomorrow.getDate())
    expect(result.getHours()).toBe(8)
    expect(result.getMinutes()).toBe(0)
  })

  it('mondayMorning returns 8 AM on a Monday', () => {
    const result = getPresetDate('mondayMorning')
    expect(result.getDay()).toBe(1) // Monday
    expect(result.getHours()).toBe(8)
  })

  it('nextWeek returns 8 AM on a Monday', () => {
    const result = getPresetDate('nextWeek')
    expect(result.getDay()).toBe(1) // Monday
    expect(result.getHours()).toBe(8)
  })

  it('nextMonth returns 8 AM on the 1st of next month', () => {
    const result = getPresetDate('nextMonth')
    const now = new Date()
    const expectedMonth = (now.getMonth() + 1) % 12
    expect(result.getMonth()).toBe(expectedMonth)
    expect(result.getDate()).toBe(1)
    expect(result.getHours()).toBe(8)
  })
})

describe('formatPresetDate', () => {
  it('returns a formatted date string', () => {
    const date = new Date(2024, 5, 15, 14, 30)
    const result = formatPresetDate(date)
    expect(result).toMatch(/Sat/)
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/15/)
  })
})

describe('getTomorrowDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getTomorrowDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns tomorrow date', () => {
    const result = getTomorrowDateString()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(result).toBe(tomorrow.toISOString().split('T')[0])
  })
})

describe('getTodayDateString', () => {
  it('returns YYYY-MM-DD format for today', () => {
    const result = getTodayDateString()
    expect(result).toBe(new Date().toISOString().split('T')[0])
  })
})

describe('parseCustomDateTime', () => {
  it('returns null for empty date', () => {
    expect(parseCustomDateTime('', '10:00')).toBeNull()
  })

  it('returns null for empty time', () => {
    expect(parseCustomDateTime('2099-01-01', '')).toBeNull()
  })

  it('parses valid future date/time', () => {
    const result = parseCustomDateTime('2099-06-15', '14:30')
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2099)
    expect(result!.getMonth()).toBe(5) // June (0-indexed)
    expect(result!.getDate()).toBe(15)
    expect(result!.getHours()).toBe(14)
    expect(result!.getMinutes()).toBe(30)
  })

  it('returns null for past date', () => {
    expect(parseCustomDateTime('2020-01-01', '10:00')).toBeNull()
  })
})
