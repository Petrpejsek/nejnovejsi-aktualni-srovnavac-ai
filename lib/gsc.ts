import { GoogleAuth } from 'google-auth-library'
import { isProduction } from '@/lib/env'

type InspectResult = {
  indexed: boolean
  coverageState?: string
  lastCrawl?: string | null
  raw: any
}

function getEnvOrThrow(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is required`)
  return v
}

/**
 * Obtain an access token for Google Search Console API.
 * - Preferred: Service Account via GCP_SA_JSON (must be added to GSC property)
 * - Fallback: OAuth2 refresh token (GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN)
 */
export async function getAccessToken(): Promise<{ token: string, mode: 'service' }> {
  const b64 = process.env.GCP_SA_JSON_BASE64
  const scopes = ['https://www.googleapis.com/auth/webmasters.readonly']
  if (!b64 || b64.trim().length === 0) {
    throw new Error('GSC not configured: GCP_SA_JSON_BASE64 missing')
  }
  try {
    const raw = b64.trim()
    const jsonString = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
    const credentials = JSON.parse(jsonString)
    const auth = new GoogleAuth({ credentials, scopes })
    const client = await auth.getClient()
    const access = await client.getAccessToken()
    const token = typeof access === 'string' ? access : (access?.token as string | undefined)
    if (!token || token.length === 0) throw new Error('Service account failed to obtain token')
    if (isProduction()) console.log('[GSC] auth mode: service')
    return { token, mode: 'service' }
  } catch (e) {
    throw new Error(`GSC service account auth failed: ${(e as Error).message}`)
  }
}

async function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

export async function inspectUrl(url: string, retries = 3): Promise<InspectResult> {
  const siteUrl = process.env.GSC_SITE_URL || ''
  if (!siteUrl && isProduction()) {
    console.warn('[GSC] GSC_SITE_URL missing; expected https://comparee.ai/')
  }
  const { token } = await getAccessToken()

  const body = {
    inspectionUrl: url,
    siteUrl,
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (res.status === 429 || res.status >= 500) {
      const backoff = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.floor(Math.random() * 200)
      await sleep(backoff)
      continue
    }
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(`GSC inspect error ${res.status}: ${t}`)
    }
    const data = await res.json()
    const idx = data?.inspectionResult?.indexStatusResult
    const coverage = idx?.coverageState as string | undefined
    const verdict = idx?.verdict as string | undefined
    const lastCrawlTime = idx?.lastCrawlTime as string | undefined
    const indexed = Boolean(verdict === 'PASS' && coverage && /Indexed/i.test(coverage))
    return {
      indexed,
      coverageState: coverage,
      lastCrawl: lastCrawlTime || null,
      raw: data,
    }
  }
  throw new Error('GSC inspect exhausted retries')
}


