import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { inspectUrl } from '@/lib/gsc'
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

    const result = await inspectUrl(url)
    const idx = (result.raw?.inspectionResult?.indexStatusResult) || {}
    const pageFetchState = (idx.pageFetchState as string | undefined) || null
    const lastCrawlTime = (idx.lastCrawlTime as string | undefined) || null
    const googleCanonical = (idx.googleCanonical as string | undefined) || null
    const userCanonical = (idx.userCanonical as string | undefined) || null

    await prisma.seo_gsc_status.upsert({
      where: { url },
      update: {
        indexed: result.indexed,
        coverage_state: result.coverageState || null,
        page_fetch_state: pageFetchState,
        last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
        google_canonical: googleCanonical,
        user_canonical: userCanonical,
        last_crawl: result.lastCrawl ? new Date(result.lastCrawl) : null,
        checked_at: new Date(),
        raw: result.raw,
      },
      create: {
        url,
        indexed: result.indexed,
        coverage_state: result.coverageState || null,
        page_fetch_state: pageFetchState,
        last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
        google_canonical: googleCanonical,
        user_canonical: userCanonical,
        last_crawl: result.lastCrawl ? new Date(result.lastCrawl) : null,
        checked_at: new Date(),
        raw: result.raw,
      },
    })

    return NextResponse.json({ ok: true, url, indexed: result.indexed, coverage_state: result.coverageState })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal' }, { status: 500 })
  }
}


