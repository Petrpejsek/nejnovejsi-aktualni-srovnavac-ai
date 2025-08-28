import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isProduction } from '@/lib/env'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    if (!isProduction()) {
      return NextResponse.json({ error: 'prod-only' }, { status: 403 })
    }
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user || (session as any).user?.role !== 'admin') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    let url: string | null = null
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}))
      url = typeof body?.url === 'string' ? body.url : null
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      url = String(form.get('url') || '')
    }
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'url required' }, { status: 400 })
    }

    // Call token-guarded sync endpoint to perform the inspection and write
    const token = process.env.GSC_CRON_TOKEN
    if (!token) return NextResponse.json({ error: 'GSC token missing' }, { status: 500 })
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/seo/gsc-sync`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-gsc-cron-token': token,
      },
      body: JSON.stringify({ urls: [url], limit: 1, dryRun: false, priority: 'all' }),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      return NextResponse.json({ error: `sync failed ${res.status}`, details: t }, { status: 500 })
    }
    // Return current DB snapshot of the URL
    const row = await prisma.seo_gsc_status.findUnique({ where: { url } })
    return NextResponse.json({ ok: true, row })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal' }, { status: 500 })
  }
}


