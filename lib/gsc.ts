import { OAuth2Client, GoogleAuth } from 'google-auth-library'
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
export async function getAccessToken(): Promise<{ token: string, mode: 'service' | 'oauth' }> {
  const sa = process.env.GCP_SA_JSON
  const scopes = ['https://www.googleapis.com/auth/webmasters.readonly']

  if (sa && sa.trim().length > 0) {
    try {
      const credentials = JSON.parse(sa)
      const auth = new GoogleAuth({ credentials, scopes })
      const client = await auth.getClient()
      const token = (await client.getAccessToken()) as string
      if (!token) throw new Error('Service account failed to obtain token')
      if (isProduction()) console.log('[GSC] auth mode: service')
      return { token, mode: 'service' }
    } catch (e) {
      // If SA configured but fails, surface the error (explicit, no silent fallback)
      throw new Error(`GSC service account auth failed: ${(e as Error).message}`)
    }
  }

  const clientId = getEnvOrThrow('GOOGLE_CLIENT_ID')
  const clientSecret = getEnvOrThrow('GOOGLE_CLIENT_SECRET')
  const refreshToken = getEnvOrThrow('GOOGLE_REFRESH_TOKEN')
  const oAuth2Client = new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
  })
  oAuth2Client.setCredentials({ refresh_token: refreshToken })
  const t = await oAuth2Client.getAccessToken()
  const token = t.token
  if (!token) throw new Error('OAuth failed to obtain token')
  if (isProduction()) console.log('[GSC] auth mode: oauth')
  return { token, mode: 'oauth' }
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


