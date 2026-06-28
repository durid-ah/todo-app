import { useEffect, useState } from 'react'
import type { Todo } from '@/types/todo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TODO_TITLE_MAX_LENGTH, validateTodoTitle } from '@/lib/todoValidation'

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onEdit: (id: number, title: string, isCompleted: boolean) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [title, setTitle] = useState(todo.title)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(todo.title)
    setError(null)
  }, [todo.title])

  function saveTitle() {
    const validationError = validateTodoTitle(title)

    if (validationError) {
      setError(validationError)
      setTitle(todo.title)
      return
    }

    const trimmed = title.trim()
    if (trimmed !== todo.title) {
      onEdit(todo.id, trimmed, todo.isCompleted)
    }

    setError(null)
  }

  return (
    <FieldGroup className="gap-1">
      <Field
        orientation="horizontal"
        className="items-center gap-3 rounded-lg border border-border bg-card p-3"
      >
        <Checkbox
          checked={todo.isCompleted}
          onCheckedChange={() => onToggle(todo)}
          aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
        />
        <Input
          aria-label={`Edit todo "${todo.title}"`}
          className={cn(
            'min-w-0 flex-1 border-transparent bg-transparent shadow-none focus-visible:border-input',
            todo.isCompleted && 'text-muted-foreground line-through',
          )}
          value={title}
          maxLength={TODO_TITLE_MAX_LENGTH}
          onChange={(event) => {
            setTitle(event.target.value)
            setError(null)
          }}
          onBlur={saveTitle}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
          aria-invalid={!!error}
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete "${todo.title}"`}
        >
          Delete
        </Button>
      </Field>
      {error && <FieldError>{error}</FieldError>}
    </FieldGroup>
  )
}
