import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

function isAdmin(session: any): boolean {
  const u = session?.user as any
  return Boolean(u?.is_superuser) || u?.role === 'admin'
}

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const nodeEnv = process.env.NODE_ENV || 'development'
  const pythonApiUrl = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_API_URL || ''
  const emailTokenSecretSet = Boolean(process.env.EMAIL_TOKEN_SECRET)
  const clientEnvUsagePass = Boolean(process.env.NEXT_PUBLIC_BASE_URL)
  return NextResponse.json({ nodeEnv, pythonApiUrl, emailTokenSecretSet, clientEnvUsagePass })
}
