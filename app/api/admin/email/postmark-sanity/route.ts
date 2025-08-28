import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  const base = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_API_URL
  if (!base) return NextResponse.json({ error: 'PYTHON_API_URL not configured' }, { status: 500 })
  const url = `${base.replace(/\/$/, '')}/admin/email/postmark-sanity`
  try {
    const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    const text = await r.text().catch(() => '')
    return new NextResponse(text || '{}', { status: r.status, headers: { 'content-type': 'application/json' } })
  } catch (e: any) {
    return NextResponse.json({ error: 'proxy timeout' }, { status: 502 })
  }
}


