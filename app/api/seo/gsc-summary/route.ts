import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getPublicBaseUrl } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

async function getServiceAccount() {
  try {
    const raw = (process.env.GCP_SA_JSON_BASE64 || '').trim()
    if (!raw) return null
    
    const jsonStr = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
    const parsed = JSON.parse(jsonStr)
    
    return {
      email: typeof parsed?.client_email === 'string' ? parsed.client_email : null,
      projectId: typeof parsed?.project_id === 'string' ? parsed.project_id : null,
      credentials: parsed
    }
  } catch (e) {
    return null
  }
}

function getPropertyUrlAndType(): { propertyUrl: string, siteType: 'domain' | 'url-prefix' | 'unknown', warning?: string } {
  const raw = process.env.GSC_SITE_URL ?? ''
  
  if (raw.startsWith('sc-domain:')) {
    return { propertyUrl: raw, siteType: 'domain' }
  }
  if (raw.startsWith('http')) {
    return { propertyUrl: raw, siteType: 'url-prefix' }
  }
  
  // Auto-infer from host
  try {
    const baseUrl = getPublicBaseUrl()
    if (baseUrl) {
      const host = new URL(baseUrl).hostname
      const inferred = `https://${host}/`
      return { propertyUrl: inferred, siteType: 'url-prefix' }
    }
  } catch (e) {
    // ignore
  }
  
  return { 
    propertyUrl: '', 
    siteType: 'unknown', 
    warning: 'invalid_property_format' 
  }
}

async function checkPropertyAccess(propertyUrl: string, credentials: any): Promise<string | null> {
  if (!propertyUrl || !credentials) return null
  
  try {
    const { GoogleAuth } = await import('google-auth-library')
    const auth = new GoogleAuth({ 
      credentials, 
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] 
    })
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    
    const res = await fetch('https://searchconsole.googleapis.com/v1/sites', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!res.ok) {
      if (res.status === 403) return 'property_not_accessible_by_sa'
      return 'not_listed_in_sites'
    }
    
    const data = await res.json()
    const sites = data?.siteEntry || []
    const hasAccess = sites.some((site: any) => site.siteUrl === propertyUrl)
    
    return hasAccess ? null : 'not_listed_in_sites'
  } catch (e) {
    const msg = String((e as Error).message || '')
    if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
      return 'property_not_accessible_by_sa'
    }
    return 'not_listed_in_sites'
  }
}

async function checkSitemap(): Promise<boolean> {
  try {
    const base = getPublicBaseUrl()
    if (!base) return false
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    
    const res = await fetch(`${base}/sitemap.xml`, { 
      method: 'HEAD', 
      signal: controller.signal,
      cache: 'no-store' 
    })
    
    clearTimeout(timeout)
    return res.status === 200
  } catch {
    return false
  }
}

export async function GET(_request: NextRequest) {
  const startedAt = Date.now()
  
  // GSC enabled flag
  const gscEnabled = process.env.GSC_SYNC_ENABLED === 'true'
  
  // Service account info
  const sa = await getServiceAccount()
  const serviceAccountLoaded = sa !== null
  const serviceAccountEmail = sa?.email || null
  const projectId = sa?.projectId || null
  
  // Property detection
  const { propertyUrl, siteType, warning: formatWarning } = getPropertyUrlAndType()
  let propertyWarning = formatWarning || null
  
  // Check property access if we have SA and property
  if (serviceAccountLoaded && propertyUrl && sa?.credentials) {
    const accessWarning = await checkPropertyAccess(propertyUrl, sa.credentials)
    if (accessWarning) {
      propertyWarning = accessWarning
    }
  }
  
  // Sitemap check
  const sitemapOk = await checkSitemap()
  
  // Landings count
  let landingsCount = 0
  try {
    landingsCount = await prisma.landing_pages.count()
  } catch {
    landingsCount = 0
  }
  
  // Last sync info
  let lastSyncAt: string | null = null
  let lastSyncStats: Record<string, any> | null = null
  try {
    const where = { url: { startsWith: 'https://comparee.ai/landing/' } }
    const [agg, byCoverageRaw] = await Promise.all([
      prisma.seo_gsc_status.aggregate({ where, _max: { checked_at: true } }),
      prisma.seo_gsc_status.groupBy({ by: ['coverage_state'], where, _count: { _all: true } }),
    ])
    
    if (agg?._max?.checked_at) {
      lastSyncAt = new Date(agg._max.checked_at as any).toISOString()
    }
    
    const by: Record<string, any> = {}
    for (const row of (byCoverageRaw as any[] | undefined) || []) {
      const key = (row?.coverage_state as string) || 'UNKNOWN'
      const cnt = row?._count?._all || 0
      by[key] = cnt
    }
    lastSyncStats = Object.keys(by).length > 0 ? by : null
  } catch {
    // ignore
  }
  
  const durationMs = Date.now() - startedAt
  
  return NextResponse.json({
    gscEnabled,
    serviceAccountLoaded,
    serviceAccountEmail,
    projectId,
    siteType,
    propertyUrl,
    propertyWarning,
    sitemapOk,
    landingsCount,
    lastSyncAt,
    lastSyncStats,
    durationMs
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}


