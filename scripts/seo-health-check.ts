#!/usr/bin/env ts-node
/*
  Simple SEO Health Check
  - Loads /sitemap.xml
  - Fetches each URL (HEAD) to verify:
    - 200 status
    - canonical tag matches URL (best-effort via HTML scan)
    - robots meta is not noindex for canonical pages
  - Prints a concise report
*/

import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

async function getSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl)
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`)
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim())
  return urls
}

async function checkUrl(url: string) {
  const res = await fetch(url, { redirect: 'manual' })
  const status = res.status
  let canonical: string | null = null
  let robotsMeta: string | null = null
  let xRobots: string | null = res.headers.get('x-robots-tag')
  let ok = status === 200

  try {
    const html = await res.text()
    const dom = new JSDOM(html)
    const doc = dom.window.document
    const link = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    const robots = doc.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    canonical = link?.href || null
    robotsMeta = robots?.content || null
    if (canonical && !canonical.startsWith('http')) {
      // Normalize relative canonical
      const u = new URL(url)
      canonical = new URL(canonical, `${u.protocol}//${u.host}`).toString()
    }
    if (canonical && canonical !== url) ok = false
    if ((robotsMeta && /noindex/i.test(robotsMeta)) || (xRobots && /noindex/i.test(xRobots))) ok = false
  } catch {
    // ignore parsing errors
  }

  return { url, status, canonical, robotsMeta, xRobots, ok }
}

async function main() {
  const base = process.env.NEXT_PUBLIC_BASE_URL as string
  const sitemapUrl = `${base}/sitemap.xml`
  const urls = await getSitemapUrls(sitemapUrl)
  console.log(`Sitemap URLs: ${urls.length}`)

  const results = await Promise.all(urls.slice(0, 200).map(checkUrl))
  const problems = results.filter(r => !r.ok)

  console.log('\n--- SEO Health Report ---')
  console.log(`Checked: ${results.length}`)
  console.log(`Problems: ${problems.length}`)
  for (const p of problems) {
    console.log(`- ${p.url} [${p.status}] canonical=${p.canonical} robots=${p.robotsMeta || p.xRobots || ''}`)
  }
}

main().catch(err => {
  console.error('SEO health check failed:', err)
  process.exit(1)
})


