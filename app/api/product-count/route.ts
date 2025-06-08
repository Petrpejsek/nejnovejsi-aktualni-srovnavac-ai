import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// In-memory cache pro poslední počet produktů - RESET pro soft delete aktualizaci
let lastProductCount: number | null = null // FORCE REFRESH - cache invalidated for soft delete update

export async function GET(request: NextRequest) {
  try {
    // Pokud cache není inicializovaná, načti z databáze - pouze aktivní produkty
    if (lastProductCount === null) {
      const count = await prisma.product.count({
        where: { isActive: true }
      })
      lastProductCount = count
      console.log(`📊 Product count initialized from database (active only): ${count}`)
    }
    
    // Vrátit cachovaný počet
    return NextResponse.json({ 
      count: lastProductCount,
      cached: true
    })
  } catch (error) {
    console.error('Error getting cached product count:', error)
    return NextResponse.json(
      { error: 'Failed to get cached count', count: 200 },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { count } = await request.json()
    
    if (typeof count === 'number' && count > 0) {
      lastProductCount = count
      console.log(`📊 Product count updated in cache: ${count}`)
      
      return NextResponse.json({ 
        success: true, 
        count: lastProductCount,
        message: 'Product count cached successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid count value' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error caching product count:', error)
    return NextResponse.json(
      { error: 'Failed to cache count' },
      { status: 500 }
    )
  }
} 