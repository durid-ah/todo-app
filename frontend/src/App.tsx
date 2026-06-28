import { AuthPage } from '@/components/AuthPage'
import { TodoForm } from '@/components/TodoForm'
import { TodoList } from '@/components/TodoList'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useTodos } from '@/hooks/useTodos'
import type { AuthSession } from '@/types/auth'
import './App.css'

function TodoApp({ user, signOut }: { user: AuthSession; signOut: () => void }) {
  const {
    todos,
    isLoading,
    isError,
    error,
    todoActions,
    isAdding,
  } = useTodos(user.email)

  return (
    <main className="app">
      <header className="app-header">
        <span className="user-email">{user.email}</span>
        <Button type="button" variant="outline" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </header>

      <h1>Todo App</h1>
      <p className="subtitle">Plan your day</p>

      <TodoForm onAdd={todoActions.addTodo} isAdding={isAdding} />

      {isLoading && <p className="loading">Loading todos…</p>}

      {isError && (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load todos'}
        </p>
      )}

      {!isLoading && !isError && (
        <TodoList
          todos={todos}
          onToggle={todoActions.toggleTodo}
          onEdit={todoActions.editTodo}
          onDelete={todoActions.removeTodo}
        />
      )}
    </main>
  )
}

function App() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth()

  if (isLoading) {
    return (
      <main className="app">
        <p className="loading">Loading…</p>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />
  }

  return <TodoApp user={user} signOut={signOut} />
}

export default App
