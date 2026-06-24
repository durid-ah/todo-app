import { useEffect, useState } from 'react'
import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onEdit: (id: number, title: string, isCompleted: boolean) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [title, setTitle] = useState(todo.title)

  useEffect(() => {
    setTitle(todo.title)
  }, [todo.title])

  function saveTitle() {
    const trimmed = title.trim()

    if (!trimmed) {
      setTitle(todo.title)
      return
    }

    if (trimmed !== todo.title) {
      onEdit(todo.id, trimmed, todo.isCompleted)
    }
  }

  return (
    <li className={`todo-item${todo.isCompleted ? ' todo-item-completed' : ''}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggle(todo)}
        aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
      />
      <input
        type="text"
        className="todo-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={saveTitle}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur()
          }
        }}
      />
      <button
        type="button"
        className="todo-delete-button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.title}"`}
      >
        Delete
      </button>
    </li>
  )
}
