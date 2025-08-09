import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Autorizace přes NextAuth (žádné JWT cookies)
    const session = await getServerSession(authOptions)
    const email = (session as any)?.user?.email as string | undefined
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Najdi firmu podle emailu ze session
    const company = await prisma.company.findFirst({
      where: { email }
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
        // Bez mock dat – základní nulové statistiky (dokud nevzniknou reálné metriky)
        stats: {
          views: 0,
          clicks: 0,
          ctr: 0
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