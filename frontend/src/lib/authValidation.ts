function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.'

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email.trim())) return 'Email format is invalid.'

  return null
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export function validateSignIn(email: string, password: string): string | null {
  return validateEmail(email) ?? validatePassword(password)
}

export function validateSignUp(email: string, password: string): string | null {
  return validateSignIn(email, password)
}
