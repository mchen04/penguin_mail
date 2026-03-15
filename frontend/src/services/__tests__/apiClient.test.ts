import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  setTokens,
  loadTokens,
  clearTokens,
  isAuthenticated,
  setOnUnauthorized,
  apiClient,
} from '../apiClient'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('Token management', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('setTokens stores both tokens', () => {
    setTokens('access123', 'refresh456')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('penguin_access_token', 'access123')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('penguin_refresh_token', 'refresh456')
  })

  it('loadTokens returns stored tokens', () => {
    setTokens('a', 'r')
    const tokens = loadTokens()
    expect(tokens.access).toBe('a')
    expect(tokens.refresh).toBe('r')
  })

  it('clearTokens removes both tokens', () => {
    setTokens('a', 'r')
    clearTokens()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('penguin_access_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('penguin_refresh_token')
  })

  it('isAuthenticated returns true when a valid JWT-shaped token exists', () => {
    setTokens('header.payload.signature', 'refresh')
    expect(isAuthenticated()).toBe(true)
  })

  it('isAuthenticated returns false when no access token', () => {
    clearTokens()
    expect(isAuthenticated()).toBe(false)
  })
})

describe('apiClient', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('get adds auth header', async () => {
    setTokens('mytoken', 'refresh')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
    )

    await apiClient.get('/emails/')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emails/'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mytoken',
        }),
      })
    )
  })

  it('get appends query params', async () => {
    setTokens('t', 'r')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    )

    await apiClient.get('/emails/', { folder: 'inbox', page: 1 })

    const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('folder=inbox')
    expect(calledUrl).toContain('page=1')
  })

  it('post sends JSON body', async () => {
    setTokens('t', 'r')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1' }), { status: 200 })
    )

    await apiClient.post('/emails/', { subject: 'Test' })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ subject: 'Test' }),
      })
    )
  })

  it('401 triggers refresh attempt', async () => {
    setTokens('expired', 'valid-refresh')

    // First call: 401
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response('', { status: 401 })
    )
    // Refresh call: success
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'new-token' }), { status: 200 })
    )
    // Retry: success
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
    )

    const result = await apiClient.get<{ data: string }>('/emails/')
    expect(result.data).toBe('ok')
    expect(globalThis.fetch).toHaveBeenCalledTimes(3)
  })

  it('401 with failed refresh calls unauthorized callback', async () => {
    const callback = vi.fn()
    setOnUnauthorized(callback)
    setTokens('expired', 'bad-refresh')

    // First call: 401
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response('', { status: 401 })
    )
    // Refresh call: fails
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response('', { status: 401 })
    )

    await expect(apiClient.get('/emails/')).rejects.toThrow('Unauthorized')
    expect(callback).toHaveBeenCalled()
  })

  it('non-401 error throws with detail message', async () => {
    setTokens('t', 'r')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Not found' }), { status: 404 })
    )

    await expect(apiClient.get('/emails/123')).rejects.toThrow('Not found')
  })
})
