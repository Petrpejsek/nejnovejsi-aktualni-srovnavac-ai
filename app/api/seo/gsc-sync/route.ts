import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { seo_gsc_status as SeoGscStatus } from '@prisma/client'
import { inspectUrl } from '@/lib/gsc'
import { isProduction } from '@/lib/env'
import { getPublicBaseUrl } from '@/lib/env'

export const runtime = 'nodejs'

function absolute(base: string, path: string) {
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

type PriorityMode = 'not_indexed_first' | 'all'

// Simple in-memory mutex to avoid concurrent syncs
let syncRunning = false

function within<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(v => { clearTimeout(t); resolve(v) }).catch(e => { clearTimeout(t); reject(e) })
  })
}

async function fetchSitemapUrls(baseUrl: string, limit: number): Promise<string[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${baseUrl}/sitemap.xml`, { signal: controller.signal, cache: 'no-store' })
    clearTimeout(timeout)
    if (!res.ok) return []
    const text = await res.text()
    const urlMatches = text.match(/<loc>([^<]+)<\/loc>/g) || []
    const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '')).filter(u => u.includes('/landing/')).slice(0, limit)
    console.log(`[GSC] extracted ${urls.length} URLs from sitemap`)
    return urls
  } catch (e) {
    console.warn(`[GSC] sitemap extraction failed: ${(e as Error).message}`)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isProduction()) return NextResponse.json({ error: 'prod-only' }, { status: 403 })

    // Diagnostics: propertyUrl + siteType from env (always include)
    const propertyUrl = process.env.GSC_SITE_URL || ''
    const siteType: 'domain' | 'url-prefix' | 'unknown' = propertyUrl.startsWith('sc-domain:') ? 'domain' : (propertyUrl.startsWith('http') ? 'url-prefix' : 'unknown')

    // Feature flag and configuration checks → 200 structured errors
    if (process.env.GSC_SYNC_ENABLED !== 'true') {
      return NextResponse.json({
        status: 'error',
        errorCode: 'disabled',
        message: 'GSC sync disabled by feature flag',
        dryRun: true,
        limit: 0,
        propertyUrl,
        siteType,
        candidateSource: null,
        candidateCount: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errorSummary: {},
        durationMs: 0
      })
    }
    if (!process.env.GCP_SA_JSON_BASE64) {
      return NextResponse.json({
        status: 'error',
        errorCode: 'not_configured',
        message: 'GSC service account not configured',
        dryRun: true,
        limit: 0,
        propertyUrl,
        siteType,
        candidateSource: null,
        candidateCount: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errorSummary: {},
        durationMs: 0
      })
    }

    // Auth header (403 for auth problems)
    const tokenHeader = request.headers.get('x-gsc-cron-token') || ''
    const expected = process.env.GSC_CRON_TOKEN || ''
    if (!expected || tokenHeader !== expected) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({})) as {
      limit?: number
      dryRun?: boolean
      priority?: string
      urls?: string[]
    }

    // Defaults: limit=25 (1..1500), dryRun=true by default
    const rawLimit = Number(body?.limit ?? 25)
    if (!Number.isFinite(rawLimit) || rawLimit < 1 || rawLimit > 1500) {
      return NextResponse.json({ status: 'error', errorCode: 'bad_request', errorHint: 'limit must be integer 1..1500' }, { status: 400 })
    }
    const limit = Math.trunc(rawLimit)
    const dryRun = body?.dryRun === undefined ? true : Boolean(body.dryRun)

    const rawPriority = body?.priority
    if (rawPriority !== undefined && rawPriority !== 'not_indexed_first' && rawPriority !== 'all') {
      return NextResponse.json({ status: 'error', errorCode: 'bad_request', errorHint: 'priority must be "not_indexed_first" or "all"' }, { status: 400 })
    }
    const priority: PriorityMode = (rawPriority as PriorityMode) || 'all'

    const urlsFromBody: string[] = Array.isArray(body.urls) ? body.urls.filter(u => typeof u === 'string' && u.startsWith('http')) : []

    if (syncRunning) {
      return NextResponse.json({
        status: 'error',
        errorCode: 'already_running',
        message: 'Another sync is in progress',
        dryRun,
        limit,
        propertyUrl,
        siteType,
        candidateSource: 'db',
        candidateCount: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errorSummary: {},
        durationMs: 0
      })
    }

    syncRunning = true
    const startedAt = Date.now()

    console.log(`[GSC] sync start dryRun=${dryRun} limit=${limit} propertyUrl=${propertyUrl} siteType=${siteType}`)

    try {
      // Build candidate URLs
      let candidates: string[] = []
      let candidateSource: 'db' | 'sitemap' = 'db'

      if (urlsFromBody.length > 0) {
        candidates = urlsFromBody
      } else {
        const base = getPublicBaseUrl()
        const landings = await prisma.landing_pages.findMany({ select: { slug: true }, orderBy: { published_at: 'desc' } })
        candidates = landings.map(lp => absolute(base, `/landing/${encodeURIComponent(lp.slug)}`))
        if (candidates.length === 0) {
          // Fallback to sitemap
          const sitemapUrls = await fetchSitemapUrls(base, limit)
          if (sitemapUrls.length === 0) {
            const durationMs = Date.now() - startedAt
            return NextResponse.json({
              status: 'error',
              errorCode: 'sitemap_unavailable',
              message: 'No candidates in DB and sitemap is unavailable or empty',
              dryRun,
              limit,
              propertyUrl,
              siteType,
              candidateSource: null,
              candidateCount: 0,
              processed: 0,
              succeeded: 0,
              failed: 0,
              errorSummary: {},
              durationMs
            })
          }
          candidates = sitemapUrls
          candidateSource = 'sitemap'
        }
      }

      if (candidates.length === 0) {
        const durationMs = Date.now() - startedAt
        return NextResponse.json({
          status: 'error',
          errorCode: 'no_candidates',
          message: 'No candidate URLs found',
          dryRun,
          limit,
          propertyUrl,
          siteType,
          candidateSource: 'db',
          candidateCount: 0,
          processed: 0,
          succeeded: 0,
          failed: 0,
          errorSummary: {},
          durationMs
        })
      }

      // Daily cap ~1500 (stay under 2000/day)
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
      }
      const batch = ordered.slice(0, effectiveLimit)

      let processed = 0, succeeded = 0, failed = 0
      const errorSummary: Record<string, number> = {}

      const tryInspectOnce = async (url: string) => {
        try {
          const res = await within(inspectUrl(url), 25000)
          const idx = (res.raw?.inspectionResult?.indexStatusResult) || {}
          const pageFetchState = idx.pageFetchState as string | undefined
          const lastCrawlTime = (idx.lastCrawlTime as string | undefined) || null
          const googleCanonical = idx.googleCanonical as string | undefined
          const userCanonical = idx.userCanonical as string | undefined
          await prisma.seo_gsc_status.upsert({
            where: { url },
            update: { indexed: res.indexed, coverage_state: res.coverageState || null, page_fetch_state: pageFetchState || null, last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null, google_canonical: googleCanonical || null, user_canonical: userCanonical || null, last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null, checked_at: new Date(), raw: res.raw },
            create: { url, indexed: res.indexed, coverage_state: res.coverageState || null, page_fetch_state: pageFetchState || null, last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null, google_canonical: googleCanonical || null, user_canonical: userCanonical || null, last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null, checked_at: new Date(), raw: res.raw },
          })
          return true
        } catch (e: any) {
          const msg = String(e?.message || '')
          let errorType = 'UNKNOWN'
          if (msg.includes('PERMISSION_DENIED')) errorType = 'PERMISSION_DENIED'
          else if (msg.includes('INVALID_ARGUMENT')) errorType = 'INVALID_ARGUMENT'
          else if (msg.includes('NOT_FOUND')) errorType = 'NOT_FOUND'
          else if (msg.includes('RESOURCE_EXHAUSTED')) errorType = 'RESOURCE_EXHAUSTED'
          else if (msg.includes('429')) errorType = 'RATE_LIMIT'
          else if (/\b5\d{2}\b/.test(msg)) errorType = 'SERVER_ERROR'
          else if (msg.includes('timeout')) errorType = 'TIMEOUT'
          errorSummary[errorType] = (errorSummary[errorType] || 0) + 1

          // One retry for 429/5xx-like errors
          if (/\b429\b/.test(msg) || /\b5\d{2}\b/.test(msg)) {
            const backoff = 500 + Math.floor(Math.random() * 1000)
            await new Promise(r => setTimeout(r, backoff))
            try {
              const res = await within(inspectUrl(url), 25000)
              const idx = (res.raw?.inspectionResult?.indexStatusResult) || {}
              const pageFetchState = idx.pageFetchState as string | undefined
              const lastCrawlTime = (idx.lastCrawlTime as string | undefined) || null
              const googleCanonical = idx.googleCanonical as string | undefined
              const userCanonical = idx.userCanonical as string | undefined
              await prisma.seo_gsc_status.upsert({
                where: { url },
                update: { indexed: res.indexed, coverage_state: res.coverageState || null, page_fetch_state: pageFetchState || null, last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null, google_canonical: googleCanonical || null, user_canonical: userCanonical || null, last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null, checked_at: new Date(), raw: res.raw },
                create: { url, indexed: res.indexed, coverage_state: res.coverageState || null, page_fetch_state: res.raw?.inspectionResult?.indexStatusResult?.pageFetchState || null, last_crawl_time: lastCrawlTime ? new Date(lastCrawlTime) : null, google_canonical: googleCanonical || null, user_canonical: userCanonical || null, last_crawl: res.lastCrawl ? new Date(res.lastCrawl) : null, checked_at: new Date(), raw: res.raw },
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
      const errorCount = Object.values(errorSummary).reduce((a, b) => a + b, 0)
      console.log(`[GSC] sync done candidates=${candidates.length} processed=${processed} succeeded=${succeeded} failed=${failed} errors=${errorCount} durationMs=${durationMs}`)

      let hint: string | null = null
      if (processed > 0 && succeeded === 0 && errorSummary.PERMISSION_DENIED && errorSummary.PERMISSION_DENIED === failed) {
        hint = 'Service Account nemá přístup k property v GSC nebo je špatně zvolen typ property. Zkontroluj GSC_SITE_URL (URL-prefix se závěsným "/") a přidej SA jako Full user do GSC.'
      }

      return NextResponse.json({
        status: 'ok',
        dryRun,
        limit: effectiveLimit,
        propertyUrl,
        siteType,
        candidateSource,
        candidateCount: candidates.length,
        processed,
        succeeded,
        failed,
        errorSummary,
        durationMs,
        ...(hint ? { hint } : {})
      })
    } finally {
      syncRunning = false
    }
  } catch (e: any) {
    return NextResponse.json({ status: 'error', errorCode: 'internal', errorHint: e?.message || 'internal' }, { status: 500 })
  }
}


