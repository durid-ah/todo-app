import { clearSession, getStoredSession, saveSession } from '@/lib/authStorage'
import type { AuthResponse, AuthSession } from '@/types/auth'

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired'

let refreshPromise: Promise<AuthSession | null> | null = null

function withAuth(
  session: AuthSession | null,
  headers?: HeadersInit,
): Headers {
  const result = new Headers(headers)
  if (session?.token) {
    result.set('Authorization', `Bearer ${session.token}`)
  }
  return result
}

function toAuthSession(data: AuthResponse): AuthSession {
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    email: data.email,
  }
}

async function refreshSessionOnce(): Promise<AuthSession | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const session = getStoredSession()
    if (!session?.refreshToken) return null

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      })

      if (!response.ok) return null

      const data = (await response.json()) as AuthResponse
      const refreshed = toAuthSession(data)
      saveSession(refreshed)
      return refreshed
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const session = getStoredSession()
  let response = await fetch(input, {
    ...init,
    headers: withAuth(session, init?.headers),
  })

  if (response.status !== 401) return response

  const refreshed = await refreshSessionOnce()
  if (!refreshed) {
    clearSession()
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT))
    return response
  }

  return fetch(input, {
    ...init,
    headers: withAuth(refreshed, init?.headers),
  })
}
