import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { NextRequest } from 'next/server'

// Konfigurace dynamického API endpointu
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// API endpoint pro admin stránku s optimalizovanými dotazy
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 50) // Max 50 produktů najednou
      const page = parseInt(searchParams.get('page') || '1', 10) 
      const skip = (page - 1) * limit
      const search = searchParams.get('search') || ''
      
      // Sestavení where podmínky pro vyhledávání
      const whereCondition = search ? {
        name: {
          contains: search,
          mode: 'insensitive' as const
        }
      } : {}
      
      // Paralelní dotazy pro rychlejší odpověď
      const [products, totalCount] = await Promise.all([
        // Optimalizovaný dotaz jen s potřebnými poli
        prisma.product.findMany({
          where: whereCondition,
          orderBy: [
            { imageUrl: { sort: 'desc', nulls: 'last' } }, // Produkty s obrázkem první
            { name: 'asc' }
          ],
          take: limit,
          skip: skip,
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
        }),
        // Počet celkem s vyhledáváním
        prisma.product.count({
          where: whereCondition
        })
      ])
      
      // Rychlé zpracování dat
      const processedProducts = products.map(product => ({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: typeof product.price === 'number' ? product.price : 0,
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        tags: safeParseArray(product.tags as string | null),
        advantages: safeParseArray(product.advantages as string | null),
        disadvantages: safeParseArray(product.disadvantages as string | null),
        detailInfo: product.detailInfo || '',
        pricingInfo: safeParsePricing(product.pricingInfo as string | null),
        videoUrls: safeParseArray(product.videoUrls as string | null),
        externalUrl: product.externalUrl || '',
        hasTrial: Boolean(product.hasTrial)
      }))
      
      const totalPages = Math.ceil(totalCount / limit)
      
      return NextResponse.json({ 
        products: processedProducts,
        count: processedProducts.length,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
    } catch (error) {
      console.error('Admin API error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
  }
}

// Optimalizované helper funkce
function safeParseArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParsePricing(jsonString: string | null): { basic: string; pro: string; enterprise: string } {
  const defaultValue = { basic: '0', pro: '0', enterprise: '0' };
  if (!jsonString) return defaultValue;
  
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        basic: String(parsed.basic || '0'),
        pro: String(parsed.pro || '0'),
        enterprise: String(parsed.enterprise || '0')
      };
    }
  } catch {
    // Ignorovat chyby parsování
  }
  
  return defaultValue;
} 