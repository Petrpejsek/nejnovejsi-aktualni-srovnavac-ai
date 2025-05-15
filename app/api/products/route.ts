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

// GET /api/products - Get all products with pagination and filters
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '3', 10)
    
    console.log('API: Processing request for products with params:', { page, pageSize })
      
      // Parameter validation
      const validPage = page > 0 ? page : 1
    const validPageSize = pageSize > 0 && pageSize <= 500 ? pageSize : 3
      
      // Calculate offset for pagination
      const skip = (validPage - 1) * validPageSize
      
    // Get total count of products
    const totalProducts = await prisma.product.count()
      
    // Get paginated products - JEDNODUCHÁ VERZE BEZ SLOŽITÉHO ZPRACOVÁNÍ
    const products = await prisma.product.findMany({
          orderBy: { name: 'asc' },
          skip,
          take: validPageSize,
        })
      
      const totalPages = Math.ceil(totalProducts / validPageSize)
      
    console.log(`API: Loaded ${products.length} products (page ${validPage}, total ${totalProducts})`)
      
    // ŽÁDNÉ ZPRACOVÁNÍ, žádné parsování - prostě vrátíme data z databáze tak jak jsou
      const response = {
      products,
        pagination: {
          page: validPage,
          pageSize: validPageSize,
          totalProducts,
          totalPages
        }
      }

    return NextResponse.json(response, { status: 200 })
    } catch (error) {
      console.error('Error loading products:', error)
        return NextResponse.json(
      { 
        error: 'Failed to load products', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
        )
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