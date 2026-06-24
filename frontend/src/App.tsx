import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import './App.css'

function App() {
  const {
    todos,
    isLoading,
    isError,
    error,
    addTodo,
    toggleTodo,
    editTodo,
    removeTodo,
    isAdding,
  } = useTodos()

  return (
    <main className="app">
      <h1>Todo App</h1>
      <p className="subtitle">Full-stack scaffold — .NET 10 API + React</p>

      <TodoForm onAdd={addTodo} isAdding={isAdding} />

      {isLoading && <p className="loading">Loading todos…</p>}

      {isError && (
        <p className="error">
          {error instanceof Error ? error.message : 'Failed to load todos'}
        </p>
      )}

      {!isLoading && !isError && (
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onEdit={editTodo}
          onDelete={removeTodo}
        />
      )}
    </main>
  )
}

export default App
