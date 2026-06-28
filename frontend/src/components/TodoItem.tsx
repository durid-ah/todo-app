import { useEffect, useState } from 'react'
import type { Todo } from '@/types/todo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
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
        className="items-start gap-3 rounded-lg border border-border bg-card p-3"
      >
        <Checkbox
          checked={todo.isCompleted}
          onCheckedChange={() => onToggle(todo)}
          className="mt-2"
          aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
        />
        <Textarea
          aria-label={`Edit todo "${todo.title}"`}
          className={cn(
            'min-h-8 min-w-0 flex-1 resize-none border-transparent bg-transparent py-1.5 shadow-none focus-visible:border-input',
            todo.isCompleted && 'text-muted-foreground line-through',
          )}
          value={title}
          maxLength={TODO_TITLE_MAX_LENGTH}
          rows={1}
          onChange={(event) => {
            setTitle(event.target.value.replace(/\n/g, ''))
            setError(null)
          }}
          onBlur={saveTitle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }}
          aria-invalid={!!error}
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="shrink-0"
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
