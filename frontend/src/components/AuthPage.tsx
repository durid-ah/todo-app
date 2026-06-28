import { useState } from 'react'
import { SignInForm } from '@/components/SignInForm'
import { SignUpForm } from '@/components/SignUpForm'
import { Button } from '@/components/ui/button'

type AuthMode = 'signin' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')

  return (
    <main className="app">
      <h1>Todo App</h1>
      <p className="subtitle">
        {mode === 'signin' ? 'Sign in to manage your todos' : 'Create an account to get started'}
      </p>

      <div className="auth-card">
        <div className="auth-toggle">
          <Button
            type="button"
            variant={mode === 'signin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('signin')}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={mode === 'signup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('signup')}
          >
            Sign up
          </Button>
        </div>

        {mode === 'signin' ? <SignInForm /> : <SignUpForm />}
      </div>
    </main>
  )
}
