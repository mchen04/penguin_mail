import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiClient, setTokens, clearTokens, isAuthenticated as checkAuth, setOnUnauthorized } from '@/services/apiClient'

interface AuthUser {
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setError(null)
  }, [])

  // Check existing auth on mount
  useEffect(() => {
    setOnUnauthorized(logout)

    if (checkAuth()) {
      // We have tokens — consider user authenticated
      // Email is stored alongside tokens for display purposes
      const storedEmail = localStorage.getItem('penguin_user_email')
      setUser(storedEmail ? { email: storedEmail } : { email: '' })
    }
    setIsLoading(false)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const data = await apiClient.post<{
        access_token: string
        refresh_token: string
        expires_in: number
      }>('/auth/login', { email, password })

      setTokens(data.access_token, data.refresh_token)
      localStorage.setItem('penguin_user_email', email)
      setUser({ email })
    } catch (e) {
      const message = (e as Error).message || 'Login failed'
      setError(message)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
