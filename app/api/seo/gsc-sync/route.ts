import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { seo_gsc_status as SeoGscStatus } from '@prisma/client'
import { inspectUrl } from '@/lib/gsc'
import { isProduction } from '@/lib/env'

export const runtime = 'nodejs'

function absolute(base: string, path: string) {
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

type PriorityMode = 'not_indexed_first' | 'stale_first' | 'all'

export async function POST(request: NextRequest) {
  try {
    if (!isProduction()) return NextResponse.json({ error: 'prod-only' }, { status: 403 })
    if (process.env.GSC_SYNC_ENABLED !== 'true') return NextResponse.json({ error: 'GSC sync disabled' }, { status: 503 })
    if (!process.env.GCP_SA_JSON_BASE64) return NextResponse.json({ error: 'GSC not configured' }, { status: 503 })
    const tokenHeader = request.headers.get('x-gsc-cron-token') || ''
    const expected = process.env.GSC_CRON_TOKEN || ''
    if (!expected || tokenHeader !== expected) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({})) as {
      limit?: number
      dryRun?: boolean
      priority?: PriorityMode
      urls?: string[]
    }
    const limit = Math.max(1, Math.min(200, Number(body.limit) || 100))
    const dryRun = Boolean(body.dryRun)
    const priority: PriorityMode = (body.priority as PriorityMode) || 'all'
    const urlsFromBody: string[] = Array.isArray(body.urls) ? body.urls.filter(u => typeof u === 'string' && u.startsWith('http')) : []

    // Build candidate URLs (landings only) or use explicitly provided URLs
    let candidates: string[]
    if (urlsFromBody.length > 0) {
      candidates = urlsFromBody
    } else {
      const base = process.env.NEXT_PUBLIC_BASE_URL || ''
      const landings = await prisma.landing_pages.findMany({
        select: { slug: true },
        orderBy: { published_at: 'desc' },
      })
      candidates = landings.map(lp => absolute(base, `/landing/${encodeURIComponent(lp.slug)}`))
    }

    // Daily cap ~1500 (stay under 2000/day): estimate already processed today
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
    const processedToday = await prisma.seo_gsc_status.count({ where: { checked_at: { gte: startOfDay }, url: { startsWith: 'https://comparee.ai/landing/' } } })
    const dailyCap = 1500
    const capLeft = Math.max(0, dailyCap - processedToday)
    const effectiveLimit = Math.min(limit, capLeft)

    // Rank by priority using existing cached statuses
    const existing: Pick<SeoGscStatus, 'url' | 'indexed' | 'user_canonical' | 'google_canonical' | 'checked_at'>[] = await prisma.seo_gsc_status.findMany({
      where: { url: { in: candidates } },
      select: { url: true, indexed: true, user_canonical: true, google_canonical: true, checked_at: true },
    })
    const byUrl = new Map(existing.map((r: any) => [r.url, r]))
    const isMismatch = (r?: { user_canonical: string | null, google_canonical: string | null }) => !!(r && r.user_canonical && r.google_canonical && r.user_canonical !== r.google_canonical)

    let ordered = [...candidates]
    if (priority === 'not_indexed_first') {
      ordered.sort((a, b) => {
        const ra = byUrl.get(a); const rb = byUrl.get(b)
        const aIdx = ra?.indexed === false ? 0 : isMismatch(ra) ? 1 : (ra?.checked_at && (Date.now() - new Date(ra.checked_at).getTime()) > 48*3600*1000 ? 2 : 3)
        const bIdx = rb?.indexed === false ? 0 : isMismatch(rb) ? 1 : (rb?.checked_at && (Date.now() - new Date(rb.checked_at).getTime()) > 48*3600*1000 ? 2 : 3)
        return aIdx - bIdx
      })
    } else if (priority === 'stale_first') {
      ordered.sort((a, b) => {
        const ra = byUrl.get(a); const rb = byUrl.get(b)
        const aStale = ra?.checked_at ? (Date.now() - new Date(ra.checked_at).getTime()) : Number.POSITIVE_INFINITY
        const bStale = rb?.checked_at ? (Date.now() - new Date(rb.checked_at).getTime()) : Number.POSITIVE_INFINITY
        return bStale - aStale
      })
    }
    const batch = ordered.slice(0, effectiveLimit)

    let processed = 0, indexed = 0, notIndexed = 0, errors = 0

    for (const url of batch) {
      try {
        if (!dryRun) {
          const result = await inspectUrl(url)
          processed++
          if (result.indexed) indexed++; else notIndexed++
          const idx = (result.raw?.inspectionResult?.indexStatusResult) || {}
          const pageFetchState = idx.pageFetchState as string | undefined
          const lastCrawlTime = (idx.lastCrawlTime as string | undefined) || null
          const googleCanonical = idx.googleCanonical as string | undefined
          const userCanonical = idx.userCanonical as string | undefined
          await prisma.seo_gsc_status.upsert({
            where: { url },
            update: {
              indexed: result.indexed,
              coverage_state: result.coverageState || null,
              page_fetch_state: pageFetchState || null,
              last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
              google_canonical: googleCanonical || null,
              user_canonical: userCanonical || null,
              last_crawl: result.lastCrawl ? new Date(result.lastCrawl) : null,
              checked_at: new Date(),
              raw: result.raw,
            },
            create: {
              url,
              indexed: result.indexed,
              coverage_state: result.coverageState || null,
              page_fetch_state: pageFetchState || null,
              last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
              google_canonical: googleCanonical || null,
              user_canonical: userCanonical || null,
              last_crawl: result.lastCrawl ? new Date(result.lastCrawl) : null,
              checked_at: new Date(),
              raw: result.raw,
            },
          })
        }
      } catch (e) {
        errors++
      }
      await new Promise(res => setTimeout(res, 120)) // ~8 rps
    }

    return NextResponse.json({
      processed,
      indexed,
      notIndexed,
      errors,
      limit: effectiveLimit,
      capLeftBefore: capLeft,
      priority,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal' }, { status: 500 })
  }
}


