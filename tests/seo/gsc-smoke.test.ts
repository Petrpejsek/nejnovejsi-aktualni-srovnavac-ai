import assert from 'node:assert'

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  const txt = await res.text()
  let json: any
  try { json = JSON.parse(txt) } catch { json = {} }
  return { res, json, txt }
}

test('GSC summary returns 200 and contains keys', async () => {
  const { res, json } = await fetchJson('http://127.0.0.1:3000/api/seo/gsc-summary')
  expect(res.status).toBe(200)
  expect(json).toHaveProperty('gscEnabled')
  expect(json).toHaveProperty('sitemapOk')
})

test('GSC sync without token is 403', async () => {
  const { res } = await fetchJson('http://127.0.0.1:3000/api/seo/gsc-sync', { method: 'POST' })
  expect(res.status).toBe(403)
})

test('GSC sync with token (dryRun, limit=2) returns 200 when SA configured', async () => {
  const token = process.env.GSC_CRON_TOKEN
  const sa = process.env.GCP_SA_JSON_BASE64
  if (!token || !sa) {
    // Skip when not configured in CI
    console.warn('Skipping SA-backed sync smoke (missing token/SA)')
    return
  }
  const { res, json } = await fetchJson('http://127.0.0.1:3000/api/seo/gsc-sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GSC-CRON-TOKEN': token,
    },
    body: JSON.stringify({ dryRun: true, limit: 2 }),
  })
  expect(res.status).toBe(200)
  expect(json.status).toBe('ok')
})


