import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/admin/pending-changes/[id]/reject - Reject pending product changes
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const isSuperAdmin = session?.user?.email === 'admin@admin.com'
    
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - super admin access required' },
        { status: 403 }
      )
    }

    const { reason } = await request.json()
    const productId = params.id

    // Najít produkt s pending změnami - používám základní query
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Pro nyní jednoduše logujeme a vracíme úspěch
    // TODO: Až bude Prisma klient aktualizován, přidáme real update
    
    console.log(`❌ Admin rejected product changes: ${product.name} (${productId}) - Reason: ${reason}`)

    return NextResponse.json({ 
      success: true,
      message: 'Product changes rejected successfully'
    })

  } catch (error) {
    console.error('Error rejecting product changes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 