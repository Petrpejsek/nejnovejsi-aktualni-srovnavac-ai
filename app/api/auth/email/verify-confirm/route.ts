import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyVerifyToken } from '@/app/lib/emailTokens'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 })

    const decoded = verifyVerifyToken(token)

    // Try boolean email_verified first
    const hasBool = await prisma.$queryRawUnsafe<any[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'email_verified'`
    )
    if (Array.isArray(hasBool) && hasBool.length > 0) {
      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { email_verified: true }
      }).catch(() => null)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      if (user && (user as any).email_verified === true) return NextResponse.json({ ok: true })
    } else {
      // Try Date emailVerified (NextAuth style)
      const hasDate = await prisma.$queryRawUnsafe<any[]>(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'emailVerified'`
      )
      if (Array.isArray(hasDate) && hasDate.length > 0) {
        const existing = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { emailVerified: true } }).catch(() => null)
        if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        if ((existing as any).emailVerified) return new NextResponse(null, { status: 204 })
        await prisma.user.update({ where: { id: decoded.userId }, data: { emailVerified: new Date() } })
        return NextResponse.json({ ok: true })
      }
      console.log('missing_email_verified_field', { userId: decoded.userId })
      return new NextResponse(null, { status: 204 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 400
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status })
  }
}


