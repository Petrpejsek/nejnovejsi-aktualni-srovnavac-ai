import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyResetToken } from '@/app/lib/emailTokens'
import { hashPassword, validatePassword } from '@/app/lib/password'

const inMemoryLimiter = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const { token, new_password } = await req.json()
    if (!token || !new_password) {
      return NextResponse.json({ error: 'token and new_password are required' }, { status: 400 })
    }

    // Idempotence: 1x per 30s per token
    const now = Date.now()
    const last = inMemoryLimiter.get(token) || 0
    if (now - last < 30_000) {
      return NextResponse.json({ ok: true, status: 'already processed' }, { status: 202 })
    }

    // Validate token and password
    const decoded = verifyResetToken(token)
    validatePassword(new_password)

    // Update password
    const hashed = await hashPassword(new_password)
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { hashedPassword: hashed }
    }).catch(() => null)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    inMemoryLimiter.set(token, now)
    console.log('tx_email.password_reset_confirmed', { userId: decoded.userId })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 400
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status })
  }
}


