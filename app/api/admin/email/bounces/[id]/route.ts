'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const PYTHON_API_URL = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_API_URL

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = Boolean((session?.user as any)?.isAdmin)
  if (!isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  if (!PYTHON_API_URL) return NextResponse.json({ error: 'PYTHON_API_URL not configured' }, { status: 500 })

  const url = `${PYTHON_API_URL}/admin/email/bounces/${encodeURIComponent(params.id)}`
  const res = await fetch(url, { method: 'GET', cache: 'no-store' })
  const data = await res.json().catch(() => ({ error: 'Invalid JSON from backend' }))
  return NextResponse.json(data, { status: res.status })
}


