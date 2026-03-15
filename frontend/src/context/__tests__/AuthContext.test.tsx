import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import type { ReactNode } from 'react'

vi.mock('@/services/apiClient', () => ({
  apiClient: { post: vi.fn() },
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  isAuthenticated: vi.fn(() => false),
  setOnUnauthorized: vi.fn(),
}))

import { AuthProvider, useAuth } from '../AuthContext'
import { apiClient, setTokens, clearTokens, isAuthenticated } from '@/services/apiClient'

const mockPost = apiClient.post as ReturnType<typeof vi.fn>
const mockSetTokens = setTokens as ReturnType<typeof vi.fn>
const mockClearTokens = clearTokens as ReturnType<typeof vi.fn>
const mockIsAuthenticated = isAuthenticated as ReturnType<typeof vi.fn>

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>
  }
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockIsAuthenticated.mockReturnValue(false)
  })

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow()
    spy.mockRestore()
  })

  it('starts with unauthenticated state', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logs in successfully and sets user', async () => {
    mockPost.mockResolvedValue({
      access_token: 'token-access',
      refresh_token: 'token-refresh',
      expires_in: 3600,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    await act(async () => {
      await result.current.login('user@example.com', 'password123')
    })

    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'user@example.com',
      password: 'password123',
    })
    expect(mockSetTokens).toHaveBeenCalledWith('token-access', 'token-refresh')
    expect(result.current.user).toEqual({ email: 'user@example.com' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('sets error state on login failure', async () => {
    mockPost.mockRejectedValue(new Error('Invalid credentials'))

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    // login throws, so we catch it and verify the error state
    let loginError: Error | undefined
    await act(async () => {
      try {
        await result.current.login('user@example.com', 'wrong')
      } catch (e) {
        loginError = e as Error
      }
    })

    expect(loginError).toBeDefined()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Invalid credentials')
  })

  it('logs out and clears user state', async () => {
    mockPost.mockResolvedValue({
      access_token: 'token-access',
      refresh_token: 'token-refresh',
      expires_in: 3600,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    await act(async () => {
      await result.current.login('user@example.com', 'password123')
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(mockClearTokens).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('auto-restores user from tokens on mount', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    localStorage.setItem('penguin_user_email', 'stored@example.com')

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    expect(result.current.user).toEqual({ email: 'stored@example.com' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('isInitializing becomes false after mount', async () => {
    mockIsAuthenticated.mockReturnValue(false)

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    // After effects run, isInitializing should be false
    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('logout removes penguin_user_email from localStorage (Bug F4)', async () => {
    mockPost.mockResolvedValue({
      access_token: 'token-access',
      refresh_token: 'token-refresh',
      expires_in: 3600,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    await act(async () => {
      await result.current.login('user@example.com', 'password123')
    })

    // Login stores penguin_user_email
    expect(localStorage.getItem('penguin_user_email')).toBe('user@example.com')

    act(() => {
      result.current.logout()
    })

    // Bug F4: logout() calls clearTokens() but clearTokens() does NOT remove
    // penguin_user_email — so this assertion WILL FAIL until the bug is fixed.
    expect(localStorage.getItem('penguin_user_email')).toBeNull()
  })

  it('isAuthenticated tracks user state correctly through login/logout cycle', async () => {
    mockPost.mockResolvedValue({
      access_token: 'a',
      refresh_token: 'r',
      expires_in: 3600,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isInitializing).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)

    await act(async () => {
      await result.current.login('u@test.com', 'pass')
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
  })
})
