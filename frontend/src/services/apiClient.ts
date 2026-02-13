const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const TOKEN_KEYS = {
  access: 'penguin_access_token',
  refresh: 'penguin_refresh_token',
} as const

let onUnauthorizedCallback: (() => void) | null = null

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEYS.access, access)
  localStorage.setItem(TOKEN_KEYS.refresh, refresh)
}

export function loadTokens(): { access: string | null; refresh: string | null } {
  return {
    access: localStorage.getItem(TOKEN_KEYS.access),
    refresh: localStorage.getItem(TOKEN_KEYS.refresh),
  }
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.access)
  localStorage.removeItem(TOKEN_KEYS.refresh)
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEYS.access)
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = loadTokens()
  if (!refresh) return null

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })

    if (!res.ok) return null

    const data = await res.json()
    localStorage.setItem(TOKEN_KEYS.access, data.access_token)
    return data.access_token
  } catch {
    return null
  }
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown
    params?: Record<string, string | number | boolean | undefined>
    isRetry?: boolean
  } = {},
): Promise<T> {
  const { body, params, isRetry } = options
  let url = `${API_URL}${path}`

  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {}
  const { access } = loadTokens()
  if (access) {
    headers['Authorization'] = `Bearer ${access}`
  }

  const fetchOptions: RequestInit = { method, headers }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    fetchOptions.body = JSON.stringify(body)
  }

  const res = await fetch(url, fetchOptions)

  if (res.status === 401 && !isRetry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return request<T>(method, path, { ...options, isRetry: true })
    }
    clearTokens()
    onUnauthorizedCallback?.()
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('GET', path, { params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>('DELETE', path, { body }),

  async upload<T>(path: string, file: File): Promise<T> {
    const url = `${API_URL}${path}`
    const formData = new FormData()
    formData.append('file', file)

    const headers: Record<string, string> = {}
    const { access } = loadTokens()
    if (access) {
      headers['Authorization'] = `Bearer ${access}`
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || `Upload failed: ${res.status}`)
    }

    return res.json()
  },
}
