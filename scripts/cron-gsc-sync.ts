import { PUBLIC_BASE_URL } from '../lib/env'

async function main() {
  const base = PUBLIC_BASE_URL
  const pages = parseInt(process.env.GSC_SYNC_PAGES || '10')
  const limit = parseInt(process.env.GSC_SYNC_LIMIT || '100')
  let total = 0, indexed = 0, notIndexed = 0, errors = 0
  for (let p = 1; p <= pages; p++) {
    const url = `${base}/api/seo/gsc-sync?page=${p}&limit=${limit}`
    const res = await fetch(url, { method: 'POST' })
    if (!res.ok) throw new Error(`gsc-sync failed p=${p} status=${res.status}`)
    const data = await res.json()
    total += data.processed || 0
    indexed += data.indexed || 0
    notIndexed += data.notIndexed || 0
    errors += data.errors || 0
    if ((data.remaining || 0) <= 0) break
    await new Promise(r => setTimeout(r, 500))
  }
  console.log(`GSC sync done: processed=${total} indexed=${indexed} notIndexed=${notIndexed} errors=${errors}`)
}

main().catch(e => { console.error(e); process.exit(1) })


