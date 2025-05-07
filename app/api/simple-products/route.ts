import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { NextRequest } from 'next/server'

// Konfigurační objekt pro API endpoint
export const dynamic = 'auto'
export const revalidate = 3600 // Revalidace jednou za hodinu

// Jednoduchý endpoint s paginací
export async function GET(request: NextRequest) {
  try {
    console.log('Simple-API: Načítám produkty z databáze')
    
    // Získání parametrů stránkování
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '30', 10)
    
    // Bezpečný limit - max 50 produktů na stránku
    const safeLimit = Math.min(limit, 50)
    const offset = (page - 1) * safeLimit
    
    // Zjištění celkového počtu produktů
    const totalCount = await prisma.product.count()
    
    // Dotaz na produkty s paginací
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      skip: offset,
      take: safeLimit,
      select: {
        id: true,
        name: true,
        price: true,
        category: true
      }
    })
    
    console.log(`Simple-API: Načteno ${products.length} produktů (stránka ${page}, limit ${safeLimit})`)
    
    // Vrátíme omezená data s informací o stránkování
    return NextResponse.json({ 
      products,
      pagination: {
        page,
        limit: safeLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit),
        hasMore: offset + products.length < totalCount
      }
    })
  } catch (error) {
    console.error('Simple-API: Chyba při načítání produktů:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání produktů' },
      { status: 500 }
    )
  }
} 