import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AUTH_SESSION_EXPIRED_EVENT } from '@/api/authFetch'
import { signIn, signUp } from '@/api/client'
import { authKeys, todoKeys } from '@/api/queryKeys'
import { clearSession, getStoredSession, saveSession } from '@/lib/authStorage'
import type { AuthResponse, AuthSession } from '@/types/auth'

interface AuthCredentials {
  email: string
  password: string
}

function toAuthSession(data: AuthResponse): AuthSession {
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    email: data.email,
  }
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: session = null, isLoading } = useQuery({
    queryKey: authKeys.session,
    queryFn: getStoredSession,
    staleTime: Infinity,
  })

  useEffect(() => {
    function handleSessionExpired() {
      clearSession()
      queryClient.setQueryData(authKeys.session, null)
      queryClient.removeQueries({ queryKey: todoKeys.all })
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () =>
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [queryClient])

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: AuthCredentials) => signIn(email, password),
    onSuccess: (data) => {
      const authSession = toAuthSession(data)
      saveSession(authSession)
      queryClient.setQueryData(authKeys.session, authSession)
    },
  })

  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: AuthCredentials) => signUp(email, password),
    onSuccess: (data) => {
      const authSession = toAuthSession(data)
      saveSession(authSession)
      queryClient.setQueryData(authKeys.session, authSession)
    },
  })

  function signOut() {
    clearSession()
    queryClient.setQueryData(authKeys.session, null)
    queryClient.removeQueries({ queryKey: todoKeys.all })
  }

  return {
    user: session,
    isAuthenticated: !!session,
    isLoading,
    signIn: (email: string, password: string) =>
      signInMutation.mutateAsync({ email, password }),
    signUp: (email: string, password: string) =>
      signUpMutation.mutateAsync({ email, password }),
    signOut,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
  }
}
