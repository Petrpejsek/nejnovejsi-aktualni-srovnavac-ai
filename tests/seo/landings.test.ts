import prisma from '../../lib/prisma'
import { PUBLIC_BASE_URL } from '../../lib/env'

function plain(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}

describe('SEO Landings', () => {
  test('strong landing: canonical self, no noindex, optional JSON-LD', async () => {
    const lp = await prisma.landing_pages.findFirst({ orderBy: { updated_at: 'desc' } })
    if (!lp) return
    const strong = plain(lp.content_html).length >= 300
    if (!strong) return
    const res = await fetch(`${PUBLIC_BASE_URL}/landing/${lp.slug}`)
    const html = await res.text()
    expect(res.status).toBe(200)
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    expect(canonical).toMatch(new RegExp(`/landing/${lp.slug}$`))
    expect(/noindex/i.test(html)).toBe(false)
  })

  test('weak landing: has noindex and is out of sitemap', async () => {
    const lp = await prisma.landing_pages.findFirst({ orderBy: { created_at: 'asc' } })
    if (!lp) return
    const weak = plain(lp.content_html).length < 300
    if (!weak) return
    const res = await fetch(`${PUBLIC_BASE_URL}/landing/${lp.slug}`)
    const html = await res.text()
    expect(res.status).toBe(200)
    expect(/noindex/i.test(html)).toBe(true)
    const sm = await fetch(`${PUBLIC_BASE_URL}/sitemap.xml`).then(r => r.text())
    expect(sm.includes(`/landing/${lp.slug}`)).toBe(false)
  })
})


