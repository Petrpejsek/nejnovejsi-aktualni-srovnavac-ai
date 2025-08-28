'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const PYTHON_API_URL = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_API_URL

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = Boolean((session?.user as any)?.isAdmin)
  if (!isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  if (!PYTHON_API_URL) return NextResponse.json({ error: 'PYTHON_API_URL not configured' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const count = searchParams.get('count')
  const offset = searchParams.get('offset')

  const url = new URL(`${PYTHON_API_URL}/admin/email/bounces`)
  if (type) url.searchParams.set('type', type)
  if (count) url.searchParams.set('count', count)
  if (offset) url.searchParams.set('offset', offset)

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' })
  const data = await res.json().catch(() => ({ error: 'Invalid JSON from backend' }))
  return NextResponse.json(data, { status: res.status })
}


