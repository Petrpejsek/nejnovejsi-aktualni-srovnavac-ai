import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sanitizeSlug } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/categories - list categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') // 'all' to include distinct product categories

    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' }
    })

    // If requested, merge with distinct Product.category values (read-only union)
    if (source === 'all') {
      const productCats = await prisma.product.groupBy({
        by: ['category'],
        where: { category: { not: null } },
        _count: { _all: true }
      })

      const extra = productCats
        .map(pc => (pc.category || '').trim())
        .filter(Boolean)
        .filter(name => !categories.some(c => c.name.toLowerCase() === name.toLowerCase()))
        .map(name => ({ id: `prod:${name}`, name, slug: sanitizeSlug(name) }))

      const merged = [...categories, ...extra].sort((a, b) => a.name.localeCompare(b.name))
      return NextResponse.json({ success: true, categories: merged })
    }

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Failed to load categories' }, { status: 500 })
  }
}

// POST /api/categories - create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = Boolean((session as any)?.user?.isAdmin) || (session as any)?.user?.role === 'admin' || (session as any)?.user?.email === 'admin@admin.com'
    const isDevAdmin = process.env.NODE_ENV === 'development' && request.headers.get('referer')?.includes('/admin/')
    if (!isAdmin && !isDevAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const nameRaw = String(body?.name || '').trim()
    const slugRaw = String(body?.slug || '').trim()
    if (!nameRaw) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const name = nameRaw
    const slug = slugRaw || sanitizeSlug(nameRaw)

    // Check existing
    const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } })
    if (exists) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
    }

    const created = await prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name,
        slug,
        updatedAt: new Date()
      },
      select: { id: true, name: true, slug: true }
    })

    return NextResponse.json({ success: true, category: created })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}