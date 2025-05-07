import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Loading product details with ID:', params.id)
    
    const product = await prisma.product.findUnique({
      where: {
        id: params.id
      }
    })

    if (!product) {
      return new NextResponse(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    console.log('Loaded product:', product)
    
    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error loading product:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    console.log('Received data for update:', data) // For debugging

    // Explicitly process externalUrl
    const externalUrl = data.externalUrl === '' ? null : data.externalUrl

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? parseFloat(data.price?.toString() || "0") : undefined,
        category: data.category,
        imageUrl: data.imageUrl,
        tags: data.tags !== undefined ? (typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || [])) : undefined,
        advantages: data.advantages !== undefined ? (typeof data.advantages === 'string' ? data.advantages : JSON.stringify(data.advantages || [])) : undefined,
        disadvantages: data.disadvantages !== undefined ? (typeof data.disadvantages === 'string' ? data.disadvantages : JSON.stringify(data.disadvantages || [])) : undefined,
        detailInfo: data.detailInfo,
        pricingInfo: data.pricingInfo !== undefined ? (typeof data.pricingInfo === 'string' ? data.pricingInfo : JSON.stringify(data.pricingInfo || {})) : undefined,
        videoUrls: data.videoUrls !== undefined ? (typeof data.videoUrls === 'string' ? data.videoUrls : JSON.stringify(data.videoUrls || [])) : undefined,
        externalUrl: externalUrl,
        hasTrial: data.hasTrial !== undefined ? Boolean(data.hasTrial) : undefined
      },
    })

    console.log('Updated product:', product) // For debugging
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    )
  }
} 