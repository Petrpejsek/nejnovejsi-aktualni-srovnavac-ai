import jwt from 'jsonwebtoken'

type Decoded = { sub: string; email: string; purpose: 'reset' | 'verify'; exp: number }

function getEmailTokenSecret(): string {
  const s = process.env.EMAIL_TOKEN_SECRET
  if (!s) throw new Error('EMAIL_TOKEN_SECRET is required')
  return s
}

export function verifyResetToken(token: string): { userId: string; email: string; purpose: 'reset' } {
  try {
    const decoded = jwt.verify(token, getEmailTokenSecret(), { algorithms: ['HS256'] }) as Decoded
    if (!decoded || decoded.purpose !== 'reset' || !decoded.sub || !decoded.email) {
      throw new Error('Invalid token payload')
    }
    return { userId: String(decoded.sub), email: decoded.email, purpose: 'reset' }
  } catch (e: any) {
    const msg = e?.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    const status = e?.name === 'TokenExpiredError' ? 401 : 400
    const err: any = new Error(msg)
    err.status = status
    throw err
  }
}

export function verifyVerifyToken(token: string): { userId: string; email: string; purpose: 'verify' } {
  try {
    const decoded = jwt.verify(token, getEmailTokenSecret(), { algorithms: ['HS256'] }) as Decoded
    if (!decoded || decoded.purpose !== 'verify' || !decoded.sub || !decoded.email) {
      throw new Error('Invalid token payload')
    }
    return { userId: String(decoded.sub), email: decoded.email, purpose: 'verify' }
  } catch (e: any) {
    const msg = e?.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    const status = e?.name === 'TokenExpiredError' ? 401 : 400
    const err: any = new Error(msg)
    err.status = status
    throw err
  }
}


