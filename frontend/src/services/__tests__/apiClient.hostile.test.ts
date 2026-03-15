/**
 * Hostile tests for apiClient utility functions.
 *
 * Bug F4: clearTokens() does NOT remove 'penguin_user_email' from localStorage.
 *         (AuthContext.login() stores it, but clearTokens() does not clear it.)
 *
 * Bug F5: isAuthenticated() only checks key presence — setting the key to any
 *         non-empty string (e.g. "authenticated") returns true.
 */

import { describe, beforeEach, it, expect } from 'vitest'
import { clearTokens, isAuthenticated, setTokens } from '../apiClient'

describe('isAuthenticated - hostile inputs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns false when localStorage is empty', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('returns true for a valid access token (happy path)', () => {
    setTokens('real.access.token', 'real.refresh.token')
    expect(isAuthenticated()).toBe(true)
  })

  it('returns false for an arbitrary non-JWT string (Bug F5)', () => {
    // Bug F5: key presence alone is checked — a non-JWT value like "authenticated"
    // should NOT grant access. After the fix, this must return false.
    localStorage.setItem('penguin_access_token', 'authenticated')
    expect(isAuthenticated()).toBe(false)
  })

  it('returns false after clearTokens removes the access token', () => {
    setTokens('some.access.token', 'some.refresh.token')
    clearTokens()
    expect(isAuthenticated()).toBe(false)
  })
})

describe('clearTokens - documents Bug F4', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('clears penguin_access_token', () => {
    setTokens('access', 'refresh')
    clearTokens()
    expect(localStorage.getItem('penguin_access_token')).toBeNull()
  })

  it('clears penguin_refresh_token', () => {
    setTokens('access', 'refresh')
    clearTokens()
    expect(localStorage.getItem('penguin_refresh_token')).toBeNull()
  })

  it('clears penguin_user_email (regression guard for Bug F4)', () => {
    // Bug F4 is fixed: clearTokens() now removes penguin_user_email.
    localStorage.setItem('penguin_user_email', 'user@example.com')
    setTokens('access', 'refresh')
    clearTokens()
    expect(localStorage.getItem('penguin_user_email')).toBeNull()
  })
})
