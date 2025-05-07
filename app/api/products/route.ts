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
  const cacheTime = 0 // Cache time in seconds - nastaveno na 0 pro vynucení čerstvých dat

  while (retries > 0) {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1', 10)
      const pageSize = parseInt(searchParams.get('pageSize') || '3', 10) // Test with 3 products
      const category = searchParams.get('category')
      const provider = searchParams.get('provider')
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')
      
      console.time('API Request')
      console.log('API: Processing request for products with params:', { page, pageSize, category, provider })
      
      // Parameter validation
      const validPage = page > 0 ? page : 1
      const validPageSize = pageSize > 0 && pageSize <= 500 ? pageSize : 3
      
      // Calculate offset for pagination
      const skip = (validPage - 1) * validPageSize
      
      // Build where condition for filters
      const where: any = {}
      if (category) where.category = category
      if (provider) where.tags = { contains: provider }
      if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) }
      if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }
      
      console.log('API: Querying database with where clause:', where)
      
      // Get total count of products (first query)
      let totalProducts = 0
      try {
        totalProducts = await prisma.product.count({ where })
        console.log('API: Total products count:', totalProducts)
      } catch (countError) {
        console.error('API: Error counting products:', countError)
        totalProducts = 0
      }
      
      // Get paginated products (second query)
      let products: Product[] = []
      try {
        products = await prisma.product.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: validPageSize,
        })
        console.log('API: Found products:', products.length)
      } catch (findError) {
        console.error('API: Error finding products:', findError)
        products = []
      }
      
      const totalPages = Math.ceil(totalProducts / validPageSize)
      
      console.timeEnd('API Request')
      console.log(`API: Loaded ${products.length} products (page ${validPage}, pageSize ${validPageSize}, total ${totalProducts})`)
      
      if (!products || products.length === 0) {
        console.log('API: No products found')
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
              'Content-Type': 'application/json'
            }
          }
        )
      }

      // Format response
      const formattedProducts = products.map(product => {
        try {
          return {
            ...product,
            tags: JSON.parse(product.tags || '[]'),
            advantages: JSON.parse(product.advantages || '[]'),
            disadvantages: JSON.parse(product.disadvantages || '[]'),
            pricingInfo: JSON.parse(product.pricingInfo || '{}'),
            videoUrls: JSON.parse(product.videoUrls || '[]')
          }
        } catch (parseError) {
          console.error('API: Error parsing product data:', parseError, product)
          return {
            ...product,
            tags: [],
            advantages: [],
            disadvantages: [],
            pricingInfo: {},
            videoUrls: []
          }
        }
      })
      
      const response = {
        products: formattedProducts,
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
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Error loading products:', error)
      retries--
      
      if (retries === 0) {
        return NextResponse.json(
          { error: 'Failed to load products', details: error instanceof Error ? error.message : 'Unknown error' },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            }
          }
        )
      }
      
      // Wait before retry
      console.log(`Retrying product loading (${retries} attempts left)...`)
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