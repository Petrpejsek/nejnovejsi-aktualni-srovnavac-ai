import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/top-lists/[id] - Get specific top list
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const topList = await prisma.topList.findUnique({
      where: { id }
    })

    if (!topList) {
      return NextResponse.json(
        { error: 'Top list not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(topList)
  } catch (error) {
    console.error('Error fetching top list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top list' },
      { status: 500 }
    )
  }
}

// PUT /api/top-lists/[id] - Update specific top list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, description, category, products, status } = body

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

    const updatedTopList = await prisma.topList.update({
      where: { id },
      data: {
        title,
        description,
        category,
        products: products,
        status: status || 'draft',
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedTopList)
  } catch (error) {
    console.error('Error updating top list:', error)
    return NextResponse.json(
      { error: 'Failed to update top list' },
      { status: 500 }
    )
  }
}

// DELETE /api/top-lists/[id] - Delete specific top list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.topList.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Top list deleted successfully' })
  } catch (error) {
    console.error('Error deleting top list:', error)
    return NextResponse.json(
      { error: 'Failed to delete top list' },
      { status: 500 }
    )
  }
}