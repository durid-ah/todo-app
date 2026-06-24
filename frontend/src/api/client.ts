import type { Todo } from '../types/todo'

export interface HealthResponse {
  status: string
}

async function handleResponse<T>(response: Response, errorPrefix: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health')
  return handleResponse<HealthResponse>(response, 'Health check failed')
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos')
  return handleResponse<Todo[]>(response, 'Failed to fetch todos')
}

export async function fetchTodo(id: number): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`)
  return handleResponse<Todo>(response, 'Failed to fetch todo')
}

export async function createTodo(title: string): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  return handleResponse<Todo>(response, 'Failed to create todo')
}

export async function updateTodo(
  id: number,
  data: { title: string; isCompleted: boolean },
): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Todo>(response, 'Failed to update todo')
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  await handleResponse<void>(response, 'Failed to delete todo')
}
