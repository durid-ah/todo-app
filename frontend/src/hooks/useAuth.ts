import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { signIn, signUp } from '@/api/client'
import { authKeys } from '@/api/queryKeys'
import { clearSession, getStoredSession, saveSession } from '@/lib/authStorage'
import type { AuthSession } from '@/types/auth'

interface AuthCredentials {
  email: string
  password: string
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: session = null, isLoading } = useQuery({
    queryKey: authKeys.session,
    queryFn: getStoredSession,
    staleTime: Infinity,
  })

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: AuthCredentials) => signIn(email, password),
    onSuccess: (data) => {
      const authSession: AuthSession = { token: data.token, email: data.email }
      saveSession(authSession)
      queryClient.setQueryData(authKeys.session, authSession)
    },
  })

  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: AuthCredentials) => signUp(email, password),
    onSuccess: (data) => {
      const authSession: AuthSession = { token: data.token, email: data.email }
      saveSession(authSession)
      queryClient.setQueryData(authKeys.session, authSession)
    },
  })

  function signOut() {
    clearSession()
    queryClient.setQueryData(authKeys.session, null)
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
