import type { Todo } from '@/types/todo'
import { TodoItem } from '@/components/TodoItem'
import { FieldGroup } from '@/components/ui/field'

interface TodoListProps {
  todos: Todo[]
  onToggle: (todo: Todo) => void
  onEdit: (id: number, title: string, isCompleted: boolean) => void
  onDelete: (id: number) => void
}

export function TodoList({ todos, onToggle, onEdit, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No todos yet. Add one above.</p>
    )
  }

  return (
    <FieldGroup className="gap-2 text-left">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </FieldGroup>
  )
}
