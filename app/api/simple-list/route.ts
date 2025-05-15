import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { NextRequest } from 'next/server'

// Nejjednodušší možný API endpoint pro seznam produktů
export async function GET(request: NextRequest) {
    try {
      // Základní query - bez žádných složitostí
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
        },
        orderBy: {
          name: 'asc'
        },
        take: 100
      })
      
      // Vrátíme jen jednoduchý objekt
      return new NextResponse(
        JSON.stringify({ 
          products: products,
          count: products.length
        }),
        { 
          status: 200, 
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      )
    } catch (error) {
      console.error('API error:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
  }
} 