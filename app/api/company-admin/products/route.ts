import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
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

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Najdi firmu podle ID z JWT tokenu
    const company = await prisma.company.findUnique({
      where: { id: user.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Najdi produkty přiřazené k této firmě + produkty které vytvořila a čekají na schválení
    const whereCondition = {
      OR: [
        // Přiřazené produkty
        ...(company.assignedProductId ? [{ id: company.assignedProductId }] : []),
        // Produkty vytvořené touto firmou (čekající na schválení)
        { changesSubmittedBy: company.id }
      ],
      deletedAt: null
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        externalUrl: true,
        hasTrial: true,
        isActive: true,
        deletedAt: true,
        // Keep only image approval fields for now
        pendingImageUrl: true,
        imageApprovalStatus: true,
        // Add pending changes fields
        changesStatus: true,
        changesSubmittedAt: true,
        changesSubmittedBy: true,
        hasPendingChanges: true,
        adminNotes: true
      }
    })

    // Transformuj produkty pro frontend
    const formattedProducts = products.map(product => {
      // Determine product status based on existing fields
      let status: 'active' | 'pending' | 'rejected' | 'draft' = 'active'
      
      // Check if this is a new product pending approval
      if (product.changesStatus === 'pending' && product.changesSubmittedBy === company.id) {
        status = 'pending'
      } else if (product.changesStatus === 'rejected') {
        status = 'rejected'
      } else if (!product.isActive) {
        status = 'draft'
      } else if (product.imageApprovalStatus === 'pending') {
        status = 'pending'
      } else if (product.imageApprovalStatus === 'rejected') {
        status = 'rejected'
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        status,
        imageUrl: product.imageUrl || '',
        category: product.category || 'Other',
        tags: Array.isArray(product.tags) ? product.tags : 
              (typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : []),
        stats: {
          views: Math.floor(Math.random() * 1000) + 100,
          clicks: Math.floor(Math.random() * 100) + 10,
          ctr: Math.round((Math.random() * 5 + 1) * 100) / 100
        },
        lastUpdated: product.updatedAt.toISOString().split('T')[0],
        createdAt: product.createdAt.toISOString(),
        externalUrl: product.externalUrl || '',
        hasTrial: product.hasTrial || false,
        // Add pending approval info
        hasPendingChanges: product.hasPendingChanges || false,
        changesStatus: product.changesStatus,
        changesSubmittedAt: product.changesSubmittedAt?.toISOString(),
        adminNotes: product.adminNotes,
        pendingImageApproval: product.imageApprovalStatus === 'pending',
        // Check if this is a new product awaiting approval
        isNewProductPending: product.changesStatus === 'pending' && 
                           product.changesSubmittedBy === company.id &&
                           (product.imageApprovalStatus === 'NEW_PRODUCT' || 
                            (product.adminNotes && product.adminNotes.includes('NEW PRODUCT')))
      }
    })

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      company: {
        id: company.id,
        name: company.name,
        email: company.email
      }
    })

  } catch (error) {
    console.error('Error loading company products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 