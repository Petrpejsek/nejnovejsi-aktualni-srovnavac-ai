import prisma from '../../lib/prisma'
import { PUBLIC_BASE_URL } from '../../lib/env'

describe('SEO Categories', () => {
  test('strong category has ItemList and canonical without noindex', async () => {
    // Find a category with >=3 products
    const cat = await prisma.category.findFirst({
      where: {
        Product: { some: {} }
      },
      include: { Product: true }
    })
    if (!cat) return
    const count = await prisma.product.count({ where: { OR: [ { category: cat.name }, { Category: { name: cat.name } } ] } })
    if (count < 3) return
    const res = await fetch(`${PUBLIC_BASE_URL}/categories/${cat.slug}`)
    const html = await res.text()
    expect(res.status).toBe(200)
    expect(html).toMatch(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[^<]*ItemList/i)
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    expect(canonical).toMatch(new RegExp(`/categories/${cat.slug}$`))
    expect(/noindex/i.test(html)).toBe(false)
  })

  test('weak category has no ItemList and is noindex', async () => {
    // Try to find or simulate a category with <3 products
    const cat = await prisma.category.findFirst({
      take: 1,
      orderBy: { createdAt: 'desc' }
    })
    if (!cat) return
    const count = await prisma.product.count({ where: { OR: [ { category: cat.name }, { Category: { name: cat.name } } ] } })
    if (count >= 3) return
    const res = await fetch(`${PUBLIC_BASE_URL}/categories/${cat.slug}`)
    const html = await res.text()
    expect(res.status).toBe(200)
    expect(/ItemList/i.test(html)).toBe(false)
    expect(/noindex/i.test(html)).toBe(true)
  })
})


