import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

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
    <form onSubmit={handleSubmit} className="mb-6">
      <FieldGroup>
        <Field orientation="horizontal" className="items-stretch gap-2 sm:items-center">
          <FieldLabel htmlFor="todo-title" className="sr-only">
            Todo title
          </FieldLabel>
          <Input
            id="todo-title"
            className="min-w-0 flex-1"
            placeholder="What needs to be done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isAdding}
          />
          <Button type="submit" disabled={isAdding || !title.trim()}>
            {isAdding ? 'Adding…' : 'Add'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
