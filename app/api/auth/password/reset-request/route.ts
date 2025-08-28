import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const PYTHON_API_URL = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_API_URL

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null)
    if (!PYTHON_API_URL) return NextResponse.json({ error: 'PYTHON_API_URL not configured' }, { status: 500 })
    const resp = await fetch(`${PYTHON_API_URL}/auth/password/reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, user_id: user?.id ?? null }),
      cache: 'no-store'
    })
    if (!resp.ok && resp.status !== 429) {
      // Map provider/render errors to 502 for client, but keep neutral success
      return NextResponse.json({ ok: true }, { status: 200 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: true })
  }
}


