import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        products: [], 
        pagination: { page: 1, limit: 0, totalCount: 0, totalPages: 1, hasMore: false }
      })
    }

    const searchTerm = query.trim()
    
    console.log('Search API - searching for:', searchTerm)

    // Jednoduché vyhledávání bez složitých podmínek
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            category: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`Search API - found ${products.length} products`)

    // Jednoduché vrácení bez složitého JSON parsing
    return NextResponse.json({
      products: products,
      pagination: {
        page: 1,
        limit: products.length,
        totalCount: products.length,
        totalPages: 1,
        hasMore: false
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Chyba při vyhledávání produktů', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 