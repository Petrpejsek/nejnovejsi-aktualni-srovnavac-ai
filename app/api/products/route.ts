import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { NextRequest } from 'next/server'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  tags: string | null
  advantages: string | null
  disadvantages: string | null
  detailInfo: string | null
  pricingInfo: string | null
  videoUrls: string | null
  externalUrl: string | null
  hasTrial: boolean
  createdAt: Date
  updatedAt: Date
}

// Konfigurujeme API jako dynamické, aby se mohlo používat request.url
export const dynamic = 'auto'

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      // Nastavíme defaultní hodnotu na vyšší číslo, aby se načetly všechny produkty
      const pageSize = parseInt(searchParams.get('pageSize') || '300', 10)
      const validPageSize = pageSize > 0 && pageSize <= 500 ? pageSize : 300
      
      console.log('API: Načítám produkty, limit:', validPageSize)
      
      // Co nejjednodušší dotaz do databáze
      const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
        take: validPageSize,
      })
      
      // Vrátíme data přímo, bez složitého zpracování
      return NextResponse.json({ 
        products,
        success: true
      }, { status: 200 })
    } catch (error) {
      console.error('API: Chyba při načítání produktů:', error)
      
      // Vrátíme základní chybovou odpověď
      return NextResponse.json({ 
        error: 'Chyba při načítání produktů', 
        success: false
      }, { status: 500 })
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Received data for product creation:', data)

    // Check required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Process data before saving - JEDNODUCHÁ VERZE
    const processedData = {
      name: data.name,
      description: data.description || '',
      price: typeof data.price === 'number' ? data.price : 0,
      category: data.category || '',
      imageUrl: data.imageUrl || '',
      tags: '[]',
      advantages: '[]',
      disadvantages: '[]',
      detailInfo: data.detailInfo || '',
      pricingInfo: '{}',
      videoUrls: '[]',
      externalUrl: data.externalUrl || null,
      hasTrial: Boolean(data.hasTrial)
    }

    const product = await prisma.product.create({
      data: processedData
    })

    // Žádné zpracování dat - vrátíme tak jak jsou
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 