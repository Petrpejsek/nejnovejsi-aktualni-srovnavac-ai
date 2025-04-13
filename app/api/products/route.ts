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

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  let retries = 3; // Maximální počet pokusů o připojení

  while (retries > 0) {
    try {
      // Získání parametrů z URL
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1', 10)
      const pageSize = parseInt(searchParams.get('pageSize') || '30', 10)
      const category = searchParams.get('category')
      
      // Validace parametrů
      const validPage = page > 0 ? page : 1
      const validPageSize = pageSize > 0 && pageSize <= 100 ? pageSize : 30
      
      // Výpočet offsetu pro stránkování
      const skip = (validPage - 1) * validPageSize
      
      // Sestavení dotazu s filtry
      const where: { category?: string } = {}
      if (category) {
        where.category = category
      }
      
      // Získání celkového počtu produktů
      const totalProducts = await prisma.product.count({
        where
      })
      
      // Získání produktů pro aktuální stránku
      const products = await prisma.product.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        skip,
        take: validPageSize
      })
      
      console.log(`API: Loaded ${products.length} products (page ${validPage}, pageSize ${validPageSize}, total ${totalProducts})`)
      
      if (!products || products.length === 0) {
        console.warn('API: No products found')
        return NextResponse.json({ error: 'No products found', totalProducts: 0, page: validPage, pageSize: validPageSize, totalPages: 0 }, { 
          status: 404,
          headers: {
            'Cache-Control': 'public, max-age=60', // Cache na 1 minutu
          }
        })
      }

      const totalPages = Math.ceil(totalProducts / validPageSize)

      return NextResponse.json({
        products,
        pagination: {
          page: validPage,
          pageSize: validPageSize,
          totalProducts,
          totalPages
        }
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60', // Cache na 1 minutu
        }
      })
    } catch (error) {
      retries--;
      
      // Při chybě připojení zkusíme znovu po krátké pauze
      if (retries > 0 && error instanceof Error && 
          (error.message.includes('Connection') || error.message.includes('timeout') || error.message.includes('Connection pool'))) {
        console.error(`API: Database connection error, retrying (${retries} attempts left)...`, error);
        
        // Počkáme před dalším pokusem
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      console.error('API: Error loading products:', error)
      return NextResponse.json(
        { error: 'Internal server error while loading products', details: error instanceof Error ? error.message : 'Unknown error' },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
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