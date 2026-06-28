import type { AuthSession } from '@/types/auth'

const STORAGE_KEY = 'todoapp.auth'

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (
      typeof parsed.token === 'string' &&
      typeof parsed.refreshToken === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return parsed
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }

  return null
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}
