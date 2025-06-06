import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/products/recent-uploads - Získá posledních naskladnění produktů
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 10

    // Získat produkty s externalUrl (ty jsou přidané přes URL upload)
    // seřazené podle data vytvoření (nejnovější první)
    const recentProducts = await prisma.product.findMany({
      where: {
        externalUrl: {
          not: null // Pouze produkty s external URL (přidané přes scraping)
        }
      },
      orderBy: {
        createdAt: 'desc' // Nejnovější první
      },
      take: Math.min(limit, 50), // Maximum 50 produktů
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        externalUrl: true,
        imageUrl: true,
        hasTrial: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
        advantages: true,
        disadvantages: true
      }
    })

    // Vyčistit JSON data pro frontend
    const cleanedProducts = recentProducts.map(product => ({
      ...product,
      tags: safeJsonParse(product.tags, []),
      advantages: safeJsonParse(product.advantages, []),
      disadvantages: safeJsonParse(product.disadvantages, [])
    }))

    console.log(`📊 Vráceno ${cleanedProducts.length} posledních naskladnění`)

    return NextResponse.json({
      success: true,
      count: cleanedProducts.length,
      products: cleanedProducts
    })

  } catch (error) {
    console.error('❌ Chyba při získávání posledních naskladnění:', error)
    return NextResponse.json({
      success: false,
      error: 'Chyba při načítání dat'
    }, { status: 500 })
  }
}

// Helper funkce pro bezpečné parsování JSON
function safeJsonParse(jsonString: string | null | any, fallback: any = null): any {
  if (!jsonString) return fallback
  
  if (typeof jsonString === 'object') {
    return jsonString
  }
  
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      console.warn('Failed to parse JSON:', jsonString)
      return fallback
    }
  }
  
  return fallback
} 