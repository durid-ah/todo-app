export const TODO_TITLE_MAX_LENGTH = 200

export function validateTodoTitle(title: string): string | null {
  const trimmed = title.trim()
  if (!trimmed) return 'Title is required.'
  if (trimmed.length > TODO_TITLE_MAX_LENGTH) {
    return `Title must be ${TODO_TITLE_MAX_LENGTH} characters or fewer.`
  }
  return null
}
