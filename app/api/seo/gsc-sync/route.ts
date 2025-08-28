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

// Simple in-memory mutex to avoid concurrent syncs
let syncRunning = false

function within<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(v => { clearTimeout(t); resolve(v) }).catch(e => { clearTimeout(t); reject(e) })
  })
}

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
    // Defaults: limit=25 (1..1500), dryRun=true by default
    const rawLimit = Number(body?.limit ?? 25)
    if (!Number.isFinite(rawLimit) || rawLimit < 1 || rawLimit > 1500) {
      return NextResponse.json({ status: 'error', errorCode: 'bad_request', errorHint: 'limit must be integer 1..1500' }, { status: 400 })
    }
    const limit = Math.trunc(rawLimit)
    const dryRun = body?.dryRun === undefined ? true : Boolean(body.dryRun)
    const priority: PriorityMode = (body.priority as PriorityMode) || 'all'
    const urlsFromBody: string[] = Array.isArray(body.urls) ? body.urls.filter(u => typeof u === 'string' && u.startsWith('http')) : []

    if (syncRunning) {
      return NextResponse.json({ status: 'error', errorCode: 'already_running', errorHint: 'sync already running' }, { status: 503 })
    }
    syncRunning = true
    const startedAt = Date.now()
    try {
      console.log(`[GSC] sync start dryRun=${dryRun} limit=${limit}`)
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

    let processed = 0, succeeded = 0, failed = 0

    const tryInspectOnce = async (url: string) => {
      try {
        const res = await within(inspectUrl(url), 25_000)
        const idx = (res.raw?.inspectionResult?.indexStatusResult) || {}
        const pageFetchState = idx.pageFetchState as string | undefined
        const lastCrawlTime = (idx.lastCrawlTime as string | undefined) || null
        const googleCanonical = idx.googleCanonical as string | undefined
        const userCanonical = idx.userCanonical as string | undefined
        await prisma.seo_gsc_status.upsert({
          where: { url },
          update: {
            indexed: res.indexed,
            coverage_state: res.coverageState || null,
            page_fetch_state: pageFetchState || null,
            last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
            google_canonical: googleCanonical || null,
            user_canonical: userCanonical || null,
            last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null,
            checked_at: new Date(),
            raw: res.raw,
          },
          create: {
            url,
            indexed: res.indexed,
            coverage_state: res.coverageState || null,
            page_fetch_state: pageFetchState || null,
            last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
            google_canonical: googleCanonical || null,
            user_canonical: userCanonical || null,
            last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null,
            checked_at: new Date(),
            raw: res.raw,
          },
        })
        return true
      } catch (e: any) {
        // One retry for 429/5xx-like errors based on message
        const msg = String(e?.message || '')
        if (/\b429\b/.test(msg) || /\b5\d{2}\b/.test(msg)) {
          const backoff = 500 + Math.floor(Math.random() * 1000)
          await new Promise(r => setTimeout(r, backoff))
          try {
            const res = await within(inspectUrl(url), 25_000)
            const idx = (res.raw?.inspectionResult?.indexStatusResult) || {}
            const pageFetchState = idx.pageFetchState as string | undefined
            const lastCrawlTime = (idx.lastCrawlTime as string | undefined) || null
            const googleCanonical = idx.googleCanonical as string | undefined
            const userCanonical = idx.userCanonical as string | undefined
            await prisma.seo_gsc_status.upsert({
              where: { url },
              update: {
                indexed: res.indexed,
                coverage_state: res.coverageState || null,
                page_fetch_state: pageFetchState || null,
                last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
                google_canonical: googleCanonical || null,
                user_canonical: userCanonical || null,
                last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null,
                checked_at: new Date(),
                raw: res.raw,
              },
              create: {
                url,
                indexed: res.indexed,
                coverage_state: res.coverageState || null,
                page_fetch_state: pageFetchState || null,
                last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null,
                google_canonical: googleCanonical || null,
                user_canonical: userCanonical || null,
                last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null,
                checked_at: new Date(),
                raw: res.raw,
              },
            })
            return true
          } catch {
            return false
          }
        }
        return false
      }
    }

    for (const url of batch) {
      if (dryRun) continue
      const ok = await tryInspectOnce(url)
      processed++
      if (ok) succeeded++; else failed++
      await new Promise(res => setTimeout(res, 120)) // ~8 rps
    }

    const durationMs = Date.now() - startedAt
    console.log(`[GSC] sync done processed=${processed} succeeded=${succeeded} failed=${failed} durationMs=${durationMs}`)
    return NextResponse.json({ status: 'ok', dryRun, limit: effectiveLimit, processed, succeeded, failed, durationMs })
    } finally {
      syncRunning = false
    }
  } catch (e: any) {
    return NextResponse.json({ status: 'error', errorCode: 'internal', errorHint: e?.message || 'internal' }, { status: 500 })
  }
}


