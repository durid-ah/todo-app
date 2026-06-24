import { type FormEvent, useState } from 'react'

interface TodoFormProps {
  onAdd: (title: string) => void
  isAdding: boolean
}

export function TodoForm({ onAdd, isAdding }: TodoFormProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmed = title.trim()
    if (!trimmed) return

    onAdd(trimmed)
    setTitle('')
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="What needs to be done?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isAdding}
      />
      <button type="submit" className="todo-add-button" disabled={isAdding || !title.trim()}>
        {isAdding ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}
