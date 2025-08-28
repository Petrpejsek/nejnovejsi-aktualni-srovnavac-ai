import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getPublicBaseUrl } from '@/lib/env'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  const startedAt = Date.now()
  const gscEnabled = process.env.GSC_SYNC_ENABLED === 'true'

  // Decode SA (do not throw on failure)
  let serviceAccountLoaded = false
  let projectId: string | undefined
  let errorHint: string | undefined
  try {
    const raw = (process.env.GCP_SA_JSON_BASE64 || '').trim()
    if (raw.length > 0) {
      const jsonStr = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
      const parsed = JSON.parse(jsonStr)
      serviceAccountLoaded = true
      projectId = typeof parsed?.project_id === 'string' ? parsed.project_id : undefined
    }
  } catch (e: any) {
    serviceAccountLoaded = false
    errorHint = 'Invalid service account JSON in GCP_SA_JSON_BASE64'
  }

  // Property URL from env (optional)
  const propertyUrl = process.env.GSC_SITE_URL || undefined

  // Sitemap HEAD
  let sitemapOk = false
  try {
    const base = getPublicBaseUrl()
    const res = await fetch(`${base}/sitemap.xml`, { method: 'HEAD', cache: 'no-store' })
    sitemapOk = res.status === 200
  } catch {
    sitemapOk = false
  }

  // Landings count (MVP)
  let landingsCount = 0
  try {
    landingsCount = await prisma.landing_pages.count()
  } catch {
    landingsCount = 0
  }

  // GSC DB aggregates (non-fatal)
  let lastSyncAt: string | undefined
  let lastSyncStats: Record<string, number> | undefined
  try {
    const where = { url: { startsWith: 'https://comparee.ai/landing/' } }
    const [agg, byCoverageRaw] = await Promise.all([
      prisma.seo_gsc_status.aggregate({ where, _max: { checked_at: true } }),
      prisma.seo_gsc_status.groupBy({ by: ['coverage_state'], where, _count: { _all: true } }),
    ])
    lastSyncAt = agg?._max?.checked_at ? new Date(agg._max.checked_at as any).toISOString() : undefined
    const by: Record<string, number> = {}
    for (const row of (byCoverageRaw as any[] | undefined) || []) {
      const key = (row?.coverage_state as string) || 'UNKNOWN'
      const cnt = row?._count?._all || 0
      by[key] = cnt
    }
    lastSyncStats = by
  } catch {
    // ignore
  }

  const durationMs = Date.now() - startedAt
  return NextResponse.json({
    gscEnabled,
    serviceAccountLoaded,
    projectId,
    propertyUrl,
    lastSyncAt,
    lastSyncStats,
    sitemapOk,
    landingsCount,
    durationMs,
    ...(errorHint ? { errorHint } : {}),
  })
}


