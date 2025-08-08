import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/top-lists - Get all top lists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // draft, published
    const category = searchParams.get('category')
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const productsLimit = parseInt(searchParams.get('productsLimit') || '20') // limit produktů per top list
    
    const whereClause: any = {}
    if (status) {
      whereClause.status = status
    }
    if (category) {
      whereClause.category = category
    }

    const topLists = await prisma.topList.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        products: true,
        status: true,
        clicks: true,
        conversion: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Pokud chceme včetně kompletních product dat (pro rychlé načítání)
    if (includeProducts) {
      // Sesbírej product IDs ze všech top listů s respektováním limitu
      const allProductIds = new Set<string>()
      topLists.forEach(list => {
        if (Array.isArray(list.products)) {
          // Vezmi jen první `productsLimit` produktů z každého listu
          const limitedProducts = list.products.slice(0, productsLimit)
          limitedProducts.forEach(id => {
            if (typeof id === 'string') {
              allProductIds.add(id)
            }
          })
        }
      })

      console.log(`📊 API Optimalizace: Načítám ${allProductIds.size} produktů místo ${topLists.reduce((acc, list) => acc + (Array.isArray(list.products) ? list.products.length : 0), 0)} (limit: ${productsLimit} per list)`)

      // Načti pouze potřebné produkty jedním query
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: Array.from(allProductIds)
          }
        },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          externalUrl: true,
          pricingInfo: true,
          tags: true,
          hasTrial: true
        }
      })

      // Normalizace tags na string[] (v DB může být JSON pole nebo string)
      const normalizedProducts = products.map((p) => {
        let normalizedTags: string[] = []
        if (Array.isArray(p.tags)) {
          normalizedTags = p.tags as unknown as string[]
        } else if (typeof p.tags === 'string') {
          try {
            normalizedTags = JSON.parse(p.tags as unknown as string) || []
          } catch {
            normalizedTags = []
          }
        }
        return { ...p, tags: normalizedTags }
      })

      // Vytvořím mapu pro rychlé hledání
      const productsMap = new Map(normalizedProducts.map(p => [p.id, p]))

      // Přidej kompletní product data do každého top listu (s limitem)
      const topListsWithProducts = topLists.map(list => ({
        ...list,
        productsData: Array.isArray(list.products) 
          ? list.products.slice(0, productsLimit)
              .filter(id => typeof id === 'string')
              .map(id => productsMap.get(id as string))
              .filter(Boolean)
          : []
      }))

      return NextResponse.json(topListsWithProducts)
    }

    return NextResponse.json(topLists)
  } catch (error) {
    console.error('Error fetching top lists:', error)
    return NextResponse.json({ error: 'Failed to fetch top lists' }, { status: 500 })
  }
}

// POST /api/top-lists - Create new top list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, products, status = 'draft' } = body

    // Validation
    if (!title || !description || !category || !products) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, products' },
        { status: 400 }
      )
    }

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products must be an array' },
        { status: 400 }
      )
    }

    if (products.length !== 20) {
      return NextResponse.json(
        { error: 'Top list must contain exactly 20 products' },
        { status: 400 }
      )
    }

    const newTopList = await prisma.topList.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        category,
        products: products, // JSON array of product IDs
        status,
        clicks: 0,
        conversion: 0.0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(newTopList, { status: 201 })
  } catch (error) {
    console.error('Error creating top list:', error)
    return NextResponse.json({ error: 'Failed to create top list' }, { status: 500 })
  }
}

// PUT /api/top-lists - Update existing top list (will be handled by [id]/route.ts)
export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Use /api/top-lists/[id] for updates' }, { status: 400 })
}

// DELETE /api/top-lists - Bulk delete (optional, will be handled by [id]/route.ts for single delete)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Use /api/top-lists/[id] for deletion' }, { status: 400 })
} 