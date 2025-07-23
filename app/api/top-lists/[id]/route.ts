import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/top-lists/[id] - Get single top list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const topList = await prisma.topList.findUnique({
      where: { id },
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

    if (!topList) {
      return NextResponse.json({ error: 'Top list not found' }, { status: 404 })
    }

    return NextResponse.json(topList)
  } catch (error) {
    console.error('Error fetching top list:', error)
    return NextResponse.json({ error: 'Failed to fetch top list' }, { status: 500 })
  }
}

// PUT /api/top-lists/[id] - Update top list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, description, category, products, status } = body

    // Check if top list exists
    const existingTopList = await prisma.topList.findUnique({
      where: { id }
    })

    if (!existingTopList) {
      return NextResponse.json({ error: 'Top list not found' }, { status: 404 })
    }

    // Validation for products if provided
    if (products && (!Array.isArray(products) || products.length !== 20)) {
      return NextResponse.json(
        { error: 'Products must be an array of exactly 20 items' },
        { status: 400 }
      )
    }

    // Update data object
    const updateData: any = {
      updatedAt: new Date()
    }

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (category) updateData.category = category
    if (products) updateData.products = products
    if (status) updateData.status = status

    const updatedTopList = await prisma.topList.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedTopList)
  } catch (error) {
    console.error('Error updating top list:', error)
    return NextResponse.json({ error: 'Failed to update top list' }, { status: 500 })
  }
}

// DELETE /api/top-lists/[id] - Delete top list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if top list exists
    const existingTopList = await prisma.topList.findUnique({
      where: { id }
    })

    if (!existingTopList) {
      return NextResponse.json({ error: 'Top list not found' }, { status: 404 })
    }

    await prisma.topList.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Top list deleted successfully' })
  } catch (error) {
    console.error('Error deleting top list:', error)
    return NextResponse.json({ error: 'Failed to delete top list' }, { status: 500 })
  }
}

// PATCH /api/top-lists/[id] - Increment clicks or update conversion
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, value } = body

    if (action === 'increment_clicks') {
      const updatedTopList = await prisma.topList.update({
        where: { id },
        data: {
          clicks: {
            increment: 1
          },
          updatedAt: new Date()
        }
      })
      return NextResponse.json(updatedTopList)
    }

    if (action === 'update_conversion' && typeof value === 'number') {
      const updatedTopList = await prisma.topList.update({
        where: { id },
        data: {
          conversion: value,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(updatedTopList)
    }

    return NextResponse.json({ error: 'Invalid action or value' }, { status: 400 })
  } catch (error) {
    console.error('Error updating top list stats:', error)
    return NextResponse.json({ error: 'Failed to update top list stats' }, { status: 500 })
  }
} 