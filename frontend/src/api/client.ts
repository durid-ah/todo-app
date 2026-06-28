import type { AuthResponse } from '../types/auth'
import type { Todo } from '../types/todo'

export interface HealthResponse {
  status: string
}

interface ApiErrorBody {
  error?: string
}

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    if (body.error) return body.error
  } catch {
    // ignore parse errors
  }

  if (response.status === 401) return 'Invalid email or password.'
  return `Request failed (${response.status})`
}

async function handleResponse<T>(response: Response, errorPrefix: string): Promise<T> {
  if (!response.ok) {
    const message = await parseErrorResponse(response)
    throw new Error(message || `${errorPrefix}: ${response.status}`)
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

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<AuthResponse>(response, 'Sign up failed')
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<AuthResponse>(response, 'Sign in failed')
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
