import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sanitizeSlug } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function normalize(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = Boolean((session as any)?.user?.isAdmin) || (session as any)?.user?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dryRun') === '1' || searchParams.get('dryRun') === 'true'

    const products = await prisma.product.findMany({
      select: { id: true, name: true, category: true, primary_category_id: true },
      where: { isActive: true }
    })

    const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } })
    const normToCategory = new Map<string, { id: string; name: string; slug: string }>()
    categories.forEach(cat => normToCategory.set(normalize(cat.name), cat))

    let created = 0
    let updated = 0
    let skipped = 0
    const previews: Array<{ id: string; name: string; from: string | null; to: string } > = []

    for (const p of products) {
      const raw = (p.category || '').trim()
      if (!raw) { skipped++; continue }
      const norm = normalize(raw)
      let cat = normToCategory.get(norm)
      if (!cat) {
        const slug = sanitizeSlug(raw)
        if (!dryRun) {
          // Try find existing by slug or case-insensitive name to avoid unique slug collision
          const existing = await prisma.category.findFirst({
            where: {
              OR: [
                { slug },
                { name: { equals: raw, mode: 'insensitive' } }
              ]
            },
            select: { id: true, name: true, slug: true }
          })
          if (existing) {
            normToCategory.set(norm, existing)
            cat = existing
          } else {
            const createdCat = await prisma.category.create({
              data: { id: crypto.randomUUID(), name: raw, slug, updatedAt: new Date() },
              select: { id: true, name: true, slug: true }
            })
            normToCategory.set(norm, createdCat)
            cat = createdCat
            created++
          }
        } else {
          // simulate creation when not present in current list
          const simulated = { id: `sim:${slug}`, name: raw, slug }
          normToCategory.set(norm, simulated as any)
          cat = simulated as any
          created++
        }
      }
      // Guard for TypeScript – cat should always be defined by here
      if (!cat || !cat.id) {
        // Safety skip in unexpected edge-case
        skipped++
        continue
      }
      const catId = cat.id
      if (p.primary_category_id !== catId) {
        if (!dryRun) {
          await prisma.product.update({ where: { id: p.id }, data: { primary_category_id: catId } })
        }
        updated++
        if (previews.length < 20) previews.push({ id: p.id, name: p.name, from: p.primary_category_id || null, to: catId })
      }
    }

    return NextResponse.json({ success: true, dryRun, createdCategories: created, updatedProducts: updated, skippedProducts: skipped, previews })
  } catch (error) {
    console.error('Backfill categories failed:', error)
    return NextResponse.json({ success: false, error: 'Backfill failed' }, { status: 500 })
  }
}


