import { NextRequest, NextResponse } from 'next/server'
import { verifyVerifyToken } from '@/app/lib/emailTokens'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json().catch(() => ({}))
    if (!token) return new NextResponse(null, { status: 204 })
    try { verifyVerifyToken(token) } catch { return NextResponse.json({ error: 'Invalid token' }, { status: 400 }) }
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}


