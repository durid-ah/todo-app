import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { TODO_TITLE_MAX_LENGTH, validateTodoTitle } from '@/lib/todoValidation'

interface TodoFormProps {
  onAdd: (title: string) => void
  isAdding: boolean
}

export function TodoForm({ onAdd, isAdding }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const validationError = validateTodoTitle(title)
    if (validationError) {
      setError(validationError)
      return
    }

    onAdd(title.trim())
    setTitle('')
    setError(null)
  }

  const isOverLimit = title.length > TODO_TITLE_MAX_LENGTH
  const canSubmit = !isAdding && title.trim().length > 0 && !isOverLimit

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <FieldGroup>
        <Field orientation="vertical">
          <div className="flex items-stretch gap-2 sm:items-center">
            <FieldLabel htmlFor="todo-title" className="sr-only">
              Todo title
            </FieldLabel>
            <Input
              id="todo-title"
              className="min-w-0 flex-1"
              placeholder="What needs to be done?"
              value={title}
              maxLength={TODO_TITLE_MAX_LENGTH}
              onChange={(event) => {
                setTitle(event.target.value)
                setError(null)
              }}
              disabled={isAdding}
              aria-invalid={!!error || isOverLimit}
            />
            <Button type="submit" disabled={!canSubmit}>
              {isAdding ? 'Adding…' : 'Add'}
            </Button>
          </div>
          <FieldDescription>
            {title.length}/{TODO_TITLE_MAX_LENGTH}
          </FieldDescription>
          {error && <FieldError>{error}</FieldError>}
        </Field>
      </FieldGroup>
    </form>
  )
}
