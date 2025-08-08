import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ověření JWT tokenu
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('advertiser-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, (() => { const v = process.env.JWT_SECRET; if (!v) throw new Error('JWT_SECRET is required'); return v })()) as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 DEBUG: Company admin edit request started', { productId: params.id })

    // Get user from JWT token
    const user = verifyToken(request)
    if (!user) {
      console.log('❌ No valid token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get company from JWT
    const company = await prisma.company.findUnique({
      where: { id: user.companyId }
    })

    if (!company) {
      console.log('❌ Company not found')
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    console.log('✅ Company admin authenticated:', {
      companyId: company.id,
      companyName: company.name
    })

    // Get existing product and verify ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if company owns this product (either assigned or created by them)
    const isAssignedProduct = company.assignedProductId === params.id
    const isCreatedByCompany = existingProduct.changesSubmittedBy === company.id

    if (!isAssignedProduct && !isCreatedByCompany) {
      console.log('❌ Product not owned by company')
      return NextResponse.json(
        { error: 'You can only edit your assigned product or products created by your company' },
        { status: 403 }
      )
    }

    console.log('✅ Product ownership verified')

    // Parse request body
    const data = await request.json()
    console.log('📝 Edit data received:', Object.keys(data))

    // Prepare pending changes data
    const pendingChanges = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      externalUrl: data.externalUrl,
      hasTrial: data.hasTrial,
      tags: data.tags,
      advantages: data.advantages,
      disadvantages: data.disadvantages,
      videoUrls: data.videoUrls,
      detailInfo: data.detailInfo,
      pricingInfo: data.pricingInfo
    }

    // Update product with pending changes
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        pendingChanges: JSON.stringify(pendingChanges),
        hasPendingChanges: true,
        changesStatus: 'pending',
        changesSubmittedAt: new Date(),
        changesSubmittedBy: company.id,
        updatedAt: new Date()
      }
    })

    console.log('✅ Product updated with pending changes')

    return NextResponse.json({
      success: true,
      isPending: true,
      message: 'Changes submitted for approval! They will be reviewed by our admin team.',
      product: updatedProduct
    })

  } catch (error) {
    console.error('❌ Error updating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 