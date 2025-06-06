import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Získáme všechny produkty pro dropdown
    const products = await prisma.product.findMany({
      orderBy: [
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        externalUrl: true,
        imageUrl: true,
        category: true,
        price: true
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