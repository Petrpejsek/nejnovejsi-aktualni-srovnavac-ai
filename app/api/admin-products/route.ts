import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { NextRequest } from 'next/server'

// API endpoint pro admin stránku s kompletními produkty
export async function GET(request: NextRequest) {
    try {
      // Základní query pro kompletní produkty
      const products = await prisma.product.findMany({
        orderBy: {
          name: 'asc'
        },
        take: 100
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
      
      // Vrátíme zpracovaná data
      return new NextResponse(
        JSON.stringify({ 
          products: processedProducts,
          count: processedProducts.length
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