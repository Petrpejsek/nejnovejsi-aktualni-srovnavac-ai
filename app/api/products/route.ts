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
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '3', 10)
    const category = searchParams.get('category')
    const provider = searchParams.get('provider')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    
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
    
    // Get total count of products
    const totalProducts = await prisma.product.count({ where })
    
    // Get paginated products
    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: validPageSize,
    })
    
    const totalPages = Math.ceil(totalProducts / validPageSize)
    
    console.log(`API: Loaded ${products.length} products (page ${validPage}, pageSize ${validPageSize}, total ${totalProducts})`)
    
    // Format response
    const formattedProducts = products.map(product => {
      try {
        // Parsování JSON stringů na objekty - zpřístupníme je pro front-end
        const formattedProduct = {
          ...product,
          tags: JSON.parse(product.tags || '[]'),
          advantages: JSON.parse(product.advantages || '[]'),
          disadvantages: JSON.parse(product.disadvantages || '[]'),
          videoUrls: JSON.parse(product.videoUrls || '[]')
        };

        // Bezpečné zpracování pricingInfo s korektní strukturou
        try {
          if (product.pricingInfo) {
            const parsed = JSON.parse(product.pricingInfo);
            // Pro front-end potřebujeme vrátit objekt místo stringu, i když typování očekává string
            // @ts-ignore - záměrně obcházíme typovou kontrolu, protože víme, že front-end očekává objekt
            formattedProduct.pricingInfo = {
              basic: typeof parsed.basic === 'string' ? parsed.basic : '0',
              pro: typeof parsed.pro === 'string' ? parsed.pro : '0',
              enterprise: typeof parsed.enterprise === 'string' ? parsed.enterprise : '0'
            };
          } else {
            // @ts-ignore - záměrně obcházíme typovou kontrolu
            formattedProduct.pricingInfo = { basic: '0', pro: '0', enterprise: '0' };
          }
        } catch (pricingError) {
          console.error('API: Error parsing pricingInfo:', pricingError);
          // @ts-ignore - záměrně obcházíme typovou kontrolu
          formattedProduct.pricingInfo = { basic: '0', pro: '0', enterprise: '0' };
        }

        return formattedProduct;
      } catch (parseError) {
        console.error('API: Error parsing product data:', parseError);
        return {
          ...product,
          tags: [],
          advantages: [],
          disadvantages: [],
          pricingInfo: { basic: '0', pro: '0', enterprise: '0' },
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

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error loading products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load products', 
        details: error instanceof Error ? error.message : 'Unknown error',
        env: process.env.DATABASE_URL ? true : false
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

    const product = await prisma.product.create({
      data: processedData
    })
    
    // Process data for response
    const responseProduct = {
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      advantages: JSON.parse(product.advantages || '[]'),
      disadvantages: JSON.parse(product.disadvantages || '[]'),
      videoUrls: JSON.parse(product.videoUrls || '[]')
    };
    
    // Bezpečné parsování pricingInfo - zachováme typovou konzistenci (pricingInfo v DB je string)
    try {
      if (product.pricingInfo) {
        const parsed = JSON.parse(product.pricingInfo);
        // Parsováním vytvoříme správný objekt a pak ho převedeme zpět na string
        const pricingObj = {
          basic: typeof parsed.basic === 'string' ? parsed.basic : '0',
          pro: typeof parsed.pro === 'string' ? parsed.pro : '0',
          enterprise: typeof parsed.enterprise === 'string' ? parsed.enterprise : '0'
        };
        // Typu responseProduct.pricingInfo je string, zachováme konzistenci
        responseProduct.pricingInfo = JSON.stringify(pricingObj);
      }
    } catch (pricingError) {
      console.error('API: Error parsing pricingInfo in response:', pricingError);
      // Typ string zachován
      responseProduct.pricingInfo = JSON.stringify({ basic: '0', pro: '0', enterprise: '0' });
    }

    return NextResponse.json(responseProduct)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 