import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from '../api/client'
import { todoKeys } from '../api/queryKeys'
import type { Todo } from '../types/todo'

interface UpdateTodoVariables {
  id: number
  title: string
  isCompleted: boolean
}

export function useTodos() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: todoKeys.all,
    queryFn: fetchTodos,
  })

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, title, isCompleted }: UpdateTodoVariables) =>
      updateTodo(id, { title, isCompleted }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  })

  return {
    todos: data ?? [],
    isLoading,
    isError,
    error,
    addTodo: (title: string) => createMutation.mutate(title),
    toggleTodo: (todo: Todo) =>
      updateMutation.mutate({
        id: todo.id,
        title: todo.title,
        isCompleted: !todo.isCompleted,
      }),
    editTodo: (id: number, title: string, isCompleted: boolean) =>
      updateMutation.mutate({ id, title, isCompleted }),
    removeTodo: (id: number) => deleteMutation.mutate(id),
    isAdding: createMutation.isPending,
  }
}
