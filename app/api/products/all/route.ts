import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Force dynamic rendering to avoid ISR problems
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Získáme pouze základní data produktů pro dropdown (omezené množství dat)
    const products = await prisma.product.findMany({
      orderBy: [
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        category: true,
        externalUrl: true
      }
    })

    return NextResponse.json({ 
      success: true,
      products 
    })

  } catch (error) {
    console.error('Error loading products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 