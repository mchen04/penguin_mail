import { vi } from 'vitest'
import { storage, generateId } from '../storage'

describe('storage service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('set and get round-trip for a string value', async () => {
    await storage.set('testKey', 'hello world')
    const result = await storage.get<string>('testKey')
    expect(result).toBe('hello world')
  })

  it('set and get round-trip for an object value', async () => {
    const obj = { name: 'Test', count: 42, nested: { a: true } }
    await storage.set('objKey', obj)
    const result = await storage.get<typeof obj>('objKey')
    expect(result).toEqual(obj)
  })

  it('get returns null for a missing key', async () => {
    const result = await storage.get('nonexistent')
    expect(result).toBeNull()
  })

  it('get returns null on JSON parse error', async () => {
    localStorage.setItem('penguin_mail_badJson', 'not valid json{{{')
    // Suppress console.error from the storage service
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await storage.get('badJson')
    expect(result).toBeNull()
    spy.mockRestore()
  })

  it('has returns true for an existing key', async () => {
    await storage.set('existsKey', 'value')
    const result = await storage.has('existsKey')
    expect(result).toBe(true)
  })

  it('has returns false for a missing key', async () => {
    const result = await storage.has('missingKey')
    expect(result).toBe(false)
  })

  it('clear removes only prefixed keys', async () => {
    await storage.set('prefixedKey', 'data')
    localStorage.setItem('other_key', 'should stay')

    await storage.clear()

    expect(localStorage.getItem('penguin_mail_prefixedKey')).toBeNull()
    expect(localStorage.getItem('other_key')).toBe('should stay')
  })

  it('uses STORAGE_PREFIX for key names', async () => {
    await storage.set('myKey', 'myValue')
    const raw = localStorage.getItem('penguin_mail_myKey')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toBe('myValue')
  })

  it('generateId returns unique values', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })

  it('set throws and logs error when localStorage.setItem throws', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(storage.set('errKey', 'value')).rejects.toThrow('Failed to save to storage')

    setItemSpy.mockRestore()
    consoleSpy.mockRestore()
  })

  it('clear logs error when localStorage throws', async () => {
    const lengthSpy = vi.spyOn(Storage.prototype, 'key').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    // Override length to trigger the loop
    Object.defineProperty(localStorage, 'length', { value: 1, configurable: true })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(storage.clear()).resolves.toBeUndefined()

    lengthSpy.mockRestore()
    consoleSpy.mockRestore()
    Object.defineProperty(localStorage, 'length', { value: 0, configurable: true })
  })

  it('serializes and deserializes Date objects correctly', async () => {
    const dateObj = { created: new Date('2026-03-13T10:00:00.000Z') }
    await storage.set('dateKey', dateObj)
    const result = await storage.get<typeof dateObj>('dateKey')
    expect(result).toBeTruthy()
    expect(result!.created).toBeInstanceOf(Date)
    expect(result!.created.toISOString()).toBe('2026-03-13T10:00:00.000Z')
  })
})
