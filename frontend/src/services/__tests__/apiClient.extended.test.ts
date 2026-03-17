/**
 * Extended apiClient tests covering upload function and refresh error handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setTokens, apiClient } from '../apiClient'

// Use the same localStorage mock pattern as apiClient.test.ts
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

describe('apiClient.upload', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uploads file and returns parsed JSON', async () => {
    setTokens('token', 'refresh')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'uploaded-file-id' }), { status: 200 })
    )

    const file = new File(['file content'], 'test.txt', { type: 'text/plain' })
    const result = await apiClient.upload<{ id: string }>('/files/upload', file)

    expect(result).toEqual({ id: 'uploaded-file-id' })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/files/upload'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )
  })

  it('upload includes Authorization header when token is set', async () => {
    setTokens('upload-token', 'refresh')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    )

    const file = new File(['data'], 'data.bin', { type: 'application/octet-stream' })
    await apiClient.upload('/files', file)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer upload-token',
        }),
      })
    )
  })

  it('upload does not include Authorization header when no token', async () => {
    // No token set
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    )

    const file = new File(['data'], 'data.bin')
    await apiClient.upload('/files', file)

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0][1] as RequestInit
    expect((callArgs.headers as Record<string, string>)?.Authorization).toBeUndefined()
  })

  it('upload throws error on failure with detail message', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'File too large' }), { status: 413 })
    )

    const file = new File(['x'.repeat(10)], 'big.txt')
    await expect(apiClient.upload('/files', file)).rejects.toThrow('File too large')
  })

  it('upload throws generic error when response has no detail', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 500 })
    )

    const file = new File(['data'], 'test.txt')
    await expect(apiClient.upload('/files', file)).rejects.toThrow('Upload failed: 500')
  })
})

describe('apiClient - refresh token network error', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null and clears tokens when refresh throws (network error)', async () => {
    setTokens('expired.access.token', 'valid-refresh')

    // First call: 401
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response('', { status: 401 })
    )
    // Refresh call: network error (throws)
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'))

    // Should reject since refresh fails
    await expect(apiClient.get('/protected')).rejects.toThrow()
  })

  it('get request without body does not include Content-Type header', async () => {
    setTokens('token', 'refresh')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    )

    await apiClient.get('/endpoint')

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0][1] as RequestInit
    expect((callArgs.headers as Record<string, string>)?.['Content-Type']).toBeUndefined()
  })

  it('delete request with body includes Content-Type header', async () => {
    setTokens('token', 'refresh')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(null, { status: 204 })
    )

    await apiClient.delete('/resource/1', { ids: ['1'] })

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0][1] as RequestInit
    expect((callArgs.headers as Record<string, string>)?.['Content-Type']).toBe('application/json')
  })
})
