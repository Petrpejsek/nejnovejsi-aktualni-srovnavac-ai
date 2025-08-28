import bcrypt from 'bcryptjs'

export async function hashPassword(plain: string): Promise<string> {
  const rounds = 12
  return bcrypt.hash(plain, rounds)
}

export function validatePassword(plain: string): void {
  if (!plain || plain.length < 8) {
    const err: any = new Error('Password must be at least 8 characters')
    err.status = 422
    throw err
  }
}


