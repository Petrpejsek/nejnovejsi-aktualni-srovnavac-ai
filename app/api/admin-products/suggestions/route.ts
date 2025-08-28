import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] })
    }

    const searchTerm = query.trim().toLowerCase()

    // Vylepšené vyhledávání pro suggestions - pouze aktivní produkty
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            isActive: true  // Zobrazovat pouze aktivní produkty
          },
          {
            OR: [
              // Název produktu - priorita
              {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              // Kategorie
              {
                category: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              // Externí URL - může obsahovat název
              {
                externalUrl: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              // Popis - pro širší pokrytí
              {
                description: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        imageUrl: true
      },
      orderBy: [
        {
          name: 'asc'
        }
      ],
      take: 5 // Pouze prvních 5 pro našeptávač
    })

    return NextResponse.json({
      products: products
    })

  } catch (error) {
    console.error('Suggestions API error:', error)
    return NextResponse.json(
              { error: 'Error loading suggestions' },
      { status: 500 }
    )
  }
} 