import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/pending-changes - Get all products with pending changes
export async function GET(request: NextRequest) {
  try {
    // Temporarily disabled authentication for testing
    // const session = await getServerSession(authOptions)
    // const isSuperAdmin = session?.user?.email === 'admin@admin.com'
    
    // if (!isSuperAdmin) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized - super admin access required' },
    //     { status: 403 }
    //   )
    // }

    // Use raw SQL query to get products with pending changes until Prisma client is updated
    const productsWithPendingChanges = await prisma.$queryRaw`
      SELECT * FROM "Product" 
      WHERE "changesStatus" = 'pending' 
      AND "deletedAt" IS NULL
      ORDER BY "updatedAt" DESC
    `

    // Format products for the response
    const formattedProducts = await Promise.all(
      (productsWithPendingChanges as any[]).map(async (product) => {
        // Find company by assignedProductId
        const company = await prisma.company.findFirst({
          where: { assignedProductId: product.id },
          select: {
            id: true,
            name: true,
            email: true
          }
        })

        // Parse pending changes if they exist
        let pendingChanges = null
        try {
          if (product.pendingChanges) {
            pendingChanges = JSON.parse(product.pendingChanges)
          }
        } catch (e) {
          console.error('Error parsing pending changes:', e)
        }

        // Determine if this is a new product or edit
        const isNewProduct = product.imageApprovalStatus === 'NEW_PRODUCT' || 
                           (product.adminNotes && product.adminNotes.includes('NEW PRODUCT'))
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          currentImageUrl: product.imageUrl,
          pendingImageUrl: product.pendingImageUrl || null,
          imageApprovalStatus: product.imageApprovalStatus,
          isNewProduct: isNewProduct,
          hasPendingChanges: product.hasPendingChanges || false,
          pendingChanges: pendingChanges,
          changesStatus: product.changesStatus,
          changesSubmittedAt: product.changesSubmittedAt ? new Date(product.changesSubmittedAt).toISOString() : null,
          changesSubmittedBy: product.changesSubmittedBy,
          adminNotes: product.adminNotes,
          // Current product data for comparison
          currentData: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            detailInfo: product.detailInfo,
            externalUrl: product.externalUrl,
            hasTrial: product.hasTrial,
            tags: product.tags,
            advantages: product.advantages,
            disadvantages: product.disadvantages,
            pricingInfo: product.pricingInfo,
            imageUrl: product.imageUrl
          },
          company: company || {
            id: 'unknown',
            name: 'Unknown Company',
            email: 'unknown@email.com'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      products: formattedProducts
    })

  } catch (error) {
    console.error('Error fetching pending changes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/pending-changes - Approve or reject pending changes
export async function POST(request: NextRequest) {
  try {
    // Temporarily disabled authentication for testing
    // const session = await getServerSession(authOptions)
    // const isSuperAdmin = session?.user?.email === 'admin@admin.com'
    
    // if (!isSuperAdmin) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized - super admin access required' },
    //     { status: 403 }
    //   )
    // }

    const { productId, action, adminNotes } = await request.json()

    if (!productId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request - productId and action (approve/reject) required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Use raw SQL to approve changes since Prisma client doesn't recognize new fields
      await prisma.$executeRaw`
        UPDATE "Product" 
        SET "changesStatus" = 'approved',
            "hasPendingChanges" = false,
            "changesApprovedAt" = NOW(),
            "changesApprovedBy" = 'admin@admin.com',
            "adminNotes" = ${adminNotes || null},
            "pendingChanges" = NULL,
            "changesSubmittedAt" = NULL,
            "changesSubmittedBy" = NULL
        WHERE "id" = ${productId}
      `
      console.log(`✅ Product changes approved: ${product.name} (${productId}) by admin@admin.com`)

    } else if (action === 'reject') {
      // Use raw SQL to reject changes  
      await prisma.$executeRaw`
        UPDATE "Product" 
        SET "changesStatus" = 'rejected',
            "hasPendingChanges" = false,
            "changesApprovedAt" = NOW(),
            "changesApprovedBy" = 'admin@admin.com',
            "adminNotes" = ${adminNotes || 'Changes rejected'},
            "pendingChanges" = NULL,
            "changesSubmittedAt" = NULL,
            "changesSubmittedBy" = NULL
        WHERE "id" = ${productId}
      `
      console.log(`❌ Product changes rejected: ${product.name} (${productId}) by admin@admin.com`)
    }

    return NextResponse.json({
      success: true,
      message: `Changes ${action}d successfully`
    })

  } catch (error) {
    console.error('Error processing pending changes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 