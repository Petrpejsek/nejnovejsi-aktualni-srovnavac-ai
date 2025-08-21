#!/usr/bin/env ts-node
import fetch from 'node-fetch'

async function main() {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  if (!base) throw new Error('NEXT_PUBLIC_BASE_URL must be set')
  const sitemap = `${base}/sitemap.xml`

  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`
  ]

  for (const url of targets) {
    try {
      const res = await fetch(url)
      console.log(`Ping ${url}: ${res.status}`)
    } catch (e) {
      console.error(`Ping failed ${url}:`, e)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


