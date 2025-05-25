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

// Funkce pro bezpečné parsování JSON
function safeJsonParse(jsonString: string | null, fallback: any = null): any {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, error);
    return fallback;
  }
}

// Funkce pro čištění produktu
function cleanProduct(product: any): any {
  return {
    ...product,
    tags: safeJsonParse(product.tags, []),
    advantages: safeJsonParse(product.advantages, []),
    disadvantages: safeJsonParse(product.disadvantages, []),
    pricingInfo: safeJsonParse(product.pricingInfo, {}),
    videoUrls: safeJsonParse(product.videoUrls, [])
  };
}

// Konfigurujeme API jako dynamické, aby se mohlo používat request.url
export const dynamic = 'auto'

// GET /api/products - Get all products with pagination and filters
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      
      // Kontrola, zda se jedná o dotaz na konkrétní ID
      const idsParam = searchParams.get('ids');
      
      if (idsParam) {
        // Načtení produktů podle konkrétních ID
        const ids = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);
        console.log('API: Loading products by IDs:', ids);
        
        if (ids.length === 0) {
          return NextResponse.json([], { status: 200 });
        }
        
        const rawProducts = await prisma.product.findMany({
          where: {
            id: {
              in: ids
            }
          },
          orderBy: { name: 'asc' }
        });
        
        // Vyčistíme produkty před odesláním
        const products = rawProducts.map(cleanProduct);
        
        console.log(`API: Successfully loaded ${products.length} products by IDs`);
        return NextResponse.json(products, { status: 200 });
      }
      
      // Spolehlivé parsování parametrů pro paginaci a filtrování
      const pageParam = searchParams.get('page');
      const pageSizeParam = searchParams.get('pageSize');
      const categoryParam = searchParams.get('category');
      
      const page = pageParam ? parseInt(pageParam, 10) : 1;
      const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 50; // Nový default – zobrazíme až 50 produktů, pokud klient nespecifikuje jinak
      
      console.log('API: Processing request for products with params:', { 
        page, 
        pageSize,
        pageParam,
        pageSizeParam,
        category: categoryParam,
        url: request.url 
      });
      
      // Parameter validation
      const validPage = page > 0 ? page : 1;
      const validPageSize = Math.min(Math.max(pageSize, 1), 1000); // min 1, max 1000
      
      // Calculate offset for pagination
      const skip = (validPage - 1) * validPageSize;
      
      // Prepare where clause for filtering
      const whereClause: any = {};
      if (categoryParam) {
        whereClause.category = categoryParam;
      }
      
      // Get total count of products (with filter)
      const totalProducts = await prisma.product.count({
        where: whereClause
      });
      
      // Get paginated products (with filter)
      const rawProducts = await prisma.product.findMany({
          where: whereClause,
          orderBy: { name: 'asc' },
          skip,
          take: validPageSize,
        });
      
      // Vyčistíme produkty před odesláním
      const products = rawProducts.map(cleanProduct);
      
      const totalPages = Math.ceil(totalProducts / validPageSize);
      
      console.log(`API: Successfully loaded ${products.length} products (page ${validPage}, pageSize ${validPageSize}, total ${totalProducts})`);
      
      const response = {
        products,
        pagination: {
          page: validPage,
          pageSize: validPageSize,
          totalProducts,
          totalPages
        }
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error loading products:', error);
        return NextResponse.json(
        { 
          error: 'Failed to load products', 
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
        );
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