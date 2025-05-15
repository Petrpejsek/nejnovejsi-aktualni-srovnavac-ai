import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { NextRequest } from 'next/server'

// Konfigurace dynamického API endpointu
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// API endpoint pro admin stránku s kompletními produkty
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      // Omezíme počet vracených produktů na 30, abychom se vešli do limitu Vercelu
      const limit = parseInt(searchParams.get('limit') || '30', 10)
      const page = parseInt(searchParams.get('page') || '1', 10) 
      const skip = (page - 1) * limit
      
      // Nejprve zjistíme celkový počet produktů
      const totalCount = await prisma.product.count()
      
      // Základní query pro kompletní produkty s limitem
      const products = await prisma.product.findMany({
        orderBy: {
          name: 'asc'
        },
        take: limit,
        skip: skip,
        // Vybereme jen potřebná pole
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          tags: true,
          advantages: true,
          disadvantages: true,
          detailInfo: true,
          pricingInfo: true,
          videoUrls: true,
          externalUrl: true,
          hasTrial: true
        }
      })
      
      // Zpracování dat pro front-end
      const processedProducts = products.map(product => {
        // Vytvoříme bezpečnou strukturu produktu
        return {
          id: product.id,
          name: product.name || '',
          description: product.description || '',
          price: typeof product.price === 'number' ? product.price : 0,
          category: product.category || '',
          imageUrl: product.imageUrl || '',
          tags: parseSafely(product.tags, []),
          advantages: parseSafely(product.advantages, []),
          disadvantages: parseSafely(product.disadvantages, []),
          detailInfo: product.detailInfo || '',
          pricingInfo: parsePricingInfo(product.pricingInfo),
          videoUrls: parseSafely(product.videoUrls, []),
          externalUrl: product.externalUrl || '',
          hasTrial: Boolean(product.hasTrial)
        }
      })
      
      // Vypočítáme informace o stránkování
      const totalPages = Math.ceil(totalCount / limit)
      
      // Vrátíme zpracovaná data s paginací
      return new NextResponse(
        JSON.stringify({ 
          products: processedProducts,
          count: processedProducts.length,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasMore: page < totalPages
          }
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
      console.error('Admin API error:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
  }
}

// Pomocná funkce pro bezpečné parsování JSON
function parseSafely(jsonString: string | null, defaultValue: any): any {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

// Pomocná funkce pro zpracování pricingInfo
function parsePricingInfo(jsonString: string | null): { basic: string; pro: string; enterprise: string } {
  const defaultValue = { basic: '0', pro: '0', enterprise: '0' };
  
  if (!jsonString) return defaultValue;
  
  try {
    const parsed = JSON.parse(jsonString);
    return {
      basic: typeof parsed.basic === 'string' ? parsed.basic : '0',
      pro: typeof parsed.pro === 'string' ? parsed.pro : '0',
      enterprise: typeof parsed.enterprise === 'string' ? parsed.enterprise : '0'
    };
  } catch (error) {
    console.error('Error parsing pricingInfo:', error);
    return defaultValue;
  }
} 