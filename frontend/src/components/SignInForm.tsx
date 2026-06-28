import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { validateSignIn } from '@/lib/authValidation'

export function SignInForm() {
  const { signIn, isSigningIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const validationError = validateSignIn(email, password)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await signIn(email, password)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field orientation="vertical">
          <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
            disabled={isSigningIn}
            aria-invalid={!!error}
          />
        </Field>
        <Field orientation="vertical">
          <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError(null)
            }}
            disabled={isSigningIn}
            aria-invalid={!!error}
          />
        </Field>
        {error && <FieldError>{error}</FieldError>}
        <Button type="submit" className="w-full" disabled={isSigningIn}>
          {isSigningIn ? 'Signing in…' : 'Sign in'}
        </Button>
      </FieldGroup>
    </form>
  )
}
