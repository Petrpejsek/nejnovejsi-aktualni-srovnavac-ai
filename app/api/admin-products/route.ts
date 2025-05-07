import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { NextRequest } from 'next/server'

// Definice typu pro zpracovaný produkt
type ProcessedProduct = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  // Změna typů - nyní jsou to pole a objekty, ne stringy
  tags: string[]
  advantages: string[]
  disadvantages: string[]
  detailInfo: string | null
  pricingInfo: {
    basic?: string
    pro?: string
    enterprise?: string
  }
  videoUrls: string[]
  externalUrl: string | null
  hasTrial: boolean
  createdAt: Date
  updatedAt: Date
}

// GET /api/admin-products - Speciální endpoint pro admin sekci
export async function GET(request: NextRequest) {
  try {
    console.log('Admin API: Načítám produkty z databáze')
    const { searchParams } = new URL(request.url)
    
    // Získáme všechny produkty
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    })
    
    console.log(`Admin API: Načteno ${products.length} produktů`)
    
    // Zpracování produktů podobným způsobem jako na hlavní stránce
    const processedProducts = products.map(product => {
      try {
        // Vytvoříme nový objekt místo kopie původního produktu
        const processedProduct: Partial<ProcessedProduct> = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          detailInfo: product.detailInfo,
          externalUrl: product.externalUrl,
          hasTrial: product.hasTrial,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
        
        // Zpracování jednotlivých JSON polí
        try {
          processedProduct.tags = product.tags 
            ? JSON.parse(product.tags) 
            : []
        } catch (e) {
          console.error(`Admin API: Chyba při parsování tags pro produkt ${product.id}:`, e)
          processedProduct.tags = []
        }
        
        try {
          processedProduct.advantages = product.advantages 
            ? JSON.parse(product.advantages) 
            : []
        } catch (e) {
          console.error(`Admin API: Chyba při parsování advantages pro produkt ${product.id}:`, e)
          processedProduct.advantages = []
        }
        
        try {
          processedProduct.disadvantages = product.disadvantages 
            ? JSON.parse(product.disadvantages) 
            : []
        } catch (e) {
          console.error(`Admin API: Chyba při parsování disadvantages pro produkt ${product.id}:`, e)
          processedProduct.disadvantages = []
        }
        
        try {
          processedProduct.videoUrls = product.videoUrls 
            ? JSON.parse(product.videoUrls) 
            : []
        } catch (e) {
          console.error(`Admin API: Chyba při parsování videoUrls pro produkt ${product.id}:`, e)
          processedProduct.videoUrls = []
        }
        
        try {
          processedProduct.pricingInfo = product.pricingInfo 
            ? JSON.parse(product.pricingInfo) 
            : { basic: "0", pro: "0", enterprise: "0" }
        } catch (e) {
          console.error(`Admin API: Chyba při parsování pricingInfo pro produkt ${product.id}:`, e)
          processedProduct.pricingInfo = { basic: "0", pro: "0", enterprise: "0" }
        }
        
        return processedProduct as ProcessedProduct
      } catch (e) {
        console.error(`Admin API: Závažná chyba při zpracování produktu ${product.id}:`, e)
        // Převedeme nejprve na unknown, abychom se vyhnuli typovým chybám
        const fallbackProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          detailInfo: product.detailInfo, // Přidáno chybějící pole
          tags: [] as string[],
          advantages: [] as string[],
          disadvantages: [] as string[],
          pricingInfo: { basic: "0", pro: "0", enterprise: "0" },
          videoUrls: [] as string[],
          externalUrl: product.externalUrl,
          hasTrial: product.hasTrial,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
        return fallbackProduct as unknown as ProcessedProduct
      }
    })
    
    return NextResponse.json({ 
      products: processedProducts,
      success: true
    })
  } catch (error) {
    console.error('Admin API: Chyba při načítání produktů:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při načítání produktů',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    )
  }
} 