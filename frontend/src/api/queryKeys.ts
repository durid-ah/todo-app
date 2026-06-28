export const todoKeys = {
  all: ['todos'] as const,
  list: (email: string) => ['todos', email] as const,
  detail: (id: number) => ['todos', id] as const,
}

export const authKeys = {
  session: ['auth', 'session'] as const,
}
