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

// GET /api/products - Get all products with pagination and filters
export async function GET(request: NextRequest) {
  let retries = 3
  const cacheTime = 60 // Cache time in seconds

  while (retries > 0) {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1', 10)
      const pageSize = parseInt(searchParams.get('pageSize') || '3', 10) // Test s 3 produkty
      const category = searchParams.get('category')
      const provider = searchParams.get('provider')
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')
      
      console.time('API Request')
      
      // Validace parametrů
      const validPage = page > 0 ? page : 1
      const validPageSize = pageSize > 0 && pageSize <= 100 ? pageSize : 3
      
      // Výpočet offsetu pro stránkování
      const skip = (validPage - 1) * validPageSize
      
      // Sestavení where podmínky pro filtry
      const where: any = {}
      if (category) where.category = category
      if (provider) where.tags = { contains: provider }
      if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) }
      if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }
      
      // Získání dat v jedné transakci
      const [totalProducts, products] = await prisma.$transaction([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: validPageSize,
        })
      ])
      
      const totalPages = Math.ceil(totalProducts / validPageSize)
      
      console.timeEnd('API Request')
      console.log(`API: Loaded ${products.length} products (page ${validPage}, pageSize ${validPageSize}, total ${totalProducts})`)
      
      if (!products || products.length === 0) {
        return NextResponse.json(
          { 
            products: [],
            pagination: {
              page: validPage,
              pageSize: validPageSize,
              totalProducts: 0,
              totalPages: 0
            }
          },
          { 
            status: 200,
            headers: {
              'Cache-Control': `public, max-age=${cacheTime}`,
            }
          }
        )
      }

      // Formátování odpovědi
      const response = {
        products: products.map(product => ({
          ...product,
          tags: JSON.parse(product.tags || '[]'),
          advantages: JSON.parse(product.advantages || '[]'),
          disadvantages: JSON.parse(product.disadvantages || '[]'),
          pricingInfo: JSON.parse(product.pricingInfo || '{}'),
          videoUrls: JSON.parse(product.videoUrls || '[]')
        })),
        pagination: {
          page: validPage,
          pageSize: validPageSize,
          totalProducts,
          totalPages
        }
      }

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}`,
        }
      })
    } catch (error) {
      console.error('Chyba při načítání produktů:', error)
      retries--
      
      if (retries === 0) {
        return NextResponse.json(
          { error: 'Nepodařilo se načíst produkty' },
          { status: 500 }
        )
      }
      
      // Počkáme před dalším pokusem
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
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

    // Process data before saving
    const processedData = {
      name: data.name,
      description: data.description || '',
      price: parseFloat(data.price?.toString() || "0"),
      category: data.category || '',
      imageUrl: data.imageUrl || '',
      tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]',
      advantages: Array.isArray(data.advantages) ? JSON.stringify(data.advantages) : '[]',
      disadvantages: Array.isArray(data.disadvantages) ? JSON.stringify(data.disadvantages) : '[]',
      detailInfo: data.detailInfo || '',
      pricingInfo: typeof data.pricingInfo === 'object' ? JSON.stringify(data.pricingInfo) : '{}',
      videoUrls: Array.isArray(data.videoUrls) ? JSON.stringify(data.videoUrls) : '[]',
      externalUrl: data.externalUrl || null,
      hasTrial: Boolean(data.hasTrial)
    }

    console.log('Processed data before saving:', processedData)

    const product = await prisma.product.create({
      data: processedData
    })

    console.log('Created product:', product)
    
    // Process data for response
    const responseProduct = {
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      advantages: JSON.parse(product.advantages || '[]'),
      disadvantages: JSON.parse(product.disadvantages || '[]'),
      pricingInfo: JSON.parse(product.pricingInfo || '{}'),
      videoUrls: JSON.parse(product.videoUrls || '[]')
    }

    return NextResponse.json(responseProduct, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 