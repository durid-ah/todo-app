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
import { validateSignUp } from '@/lib/authValidation'

export function SignUpForm() {
  const { signUp, isSigningUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const validationError = validateSignUp(email, password)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await signUp(email, password)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field orientation="vertical">
          <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
            disabled={isSigningUp}
            aria-invalid={!!error}
          />
        </Field>
        <Field orientation="vertical">
          <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
          <Input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError(null)
            }}
            disabled={isSigningUp}
            aria-invalid={!!error}
          />
        </Field>
        {error && <FieldError>{error}</FieldError>}
        <Button type="submit" className="w-full" disabled={isSigningUp}>
          {isSigningUp ? 'Creating account…' : 'Sign up'}
        </Button>
      </FieldGroup>
    </form>
  )
}
