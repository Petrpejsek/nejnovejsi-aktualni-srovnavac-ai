import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/top-lists - Get all top lists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // draft, published
    const category = searchParams.get('category')
    
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
        title,
        description,
        category,
        products: products, // JSON array of product IDs
        status,
        clicks: 0,
        conversion: 0.0
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