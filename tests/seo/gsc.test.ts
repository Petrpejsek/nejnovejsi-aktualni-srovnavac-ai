import { inspectUrl } from '../../lib/gsc'

test('inspectUrl maps response to indexed/coverage/lastCrawl', async () => {
  const originalFetch = global.fetch
  // @ts-ignore
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      inspectionResult: {
        indexStatusResult: {
          verdict: 'PASS',
          coverageState: 'Indexed, low interest',
          lastCrawlTime: '2025-01-02T03:04:05Z'
        }
      }
    })
  })
  try {
    // @ts-ignore
    process.env.GSC_SITE_URL = 'https://comparee.ai/'
    // @ts-ignore
    process.env.GOOGLE_CLIENT_ID = 'x'
    // @ts-ignore
    process.env.GOOGLE_CLIENT_SECRET = 'y'
    // @ts-ignore
    process.env.GOOGLE_REFRESH_TOKEN = 'z'
    // Mock OAuth client by monkeypatching getAccessToken
    const mod = await import('google-auth-library') as any
    const prev = mod.OAuth2Client.prototype.getAccessToken
    mod.OAuth2Client.prototype.getAccessToken = async () => ({ token: 't' })
    const res = await inspectUrl('https://comparee.ai/landing/example')
    expect(res.indexed).toBe(true)
    expect(res.coverageState).toMatch(/Indexed/i)
    expect(res.lastCrawl).toBe('2025-01-02T03:04:05Z')
    mod.OAuth2Client.prototype.getAccessToken = prev
  } finally {
    global.fetch = originalFetch
  }
})


