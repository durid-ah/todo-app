import { clearSession, getStoredSession } from '@/lib/authStorage'

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired'

function withAuth(
  session: ReturnType<typeof getStoredSession>,
  headers?: HeadersInit,
): Headers {
  const result = new Headers(headers)
  if (session?.token) {
    result.set('Authorization', `Bearer ${session.token}`)
  }
  return result
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const session = getStoredSession()
  const response = await fetch(input, {
    ...init,
    headers: withAuth(session, init?.headers),
  })

  if (response.status === 401) {
    clearSession()
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT))
  }

  return response
}
