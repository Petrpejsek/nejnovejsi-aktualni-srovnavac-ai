import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

// Základní typ pro produkt bez velkých polí dat
type BriefProduct = {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  imageUrl: string | null
  externalUrl: string | null
  hasTrial: boolean
  // Zachováváme pole tagů pro zobrazení, ale omezujeme ostatní velká pole
  tags: string[]
}

// GET /api/admin-products - Speciální endpoint pro admin sekci
export async function GET() {
  try {
    console.log('Admin API: Načítám produkty z databáze')
    
    // Získáme všechny produkty, ale jen vybraná pole
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true,
        tags: true,
        externalUrl: true,
        hasTrial: true,
        // Vynecháváme velká pole, abychom snížili velikost odpovědi
        // advantages: false,
        // disadvantages: false, 
        // detailInfo: false,
        // pricingInfo: false,
        // videoUrls: false,
      }
    })
    
    console.log(`Admin API: Načteno ${products.length} produktů`)
    
    // Zpracování produktů, ale jen základních polí
    const processedProducts = products.map(product => {
      try {
        // Vytvoříme nový zjednodušený objekt
        const briefProduct: Partial<BriefProduct> = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          externalUrl: product.externalUrl,
          hasTrial: product.hasTrial
        }
        
        // Zpracujeme jen tagy, které jsou potřeba pro zobrazení
        try {
          briefProduct.tags = product.tags 
            ? JSON.parse(product.tags) 
            : []
        } catch (e) {
          console.error(`Admin API: Chyba při parsování tags pro produkt ${product.id}:`, e)
          briefProduct.tags = []
        }
        
        return briefProduct as BriefProduct
      } catch (e) {
        console.error(`Admin API: Závažná chyba při zpracování produktu ${product.id}:`, e)
        return {
          id: product.id,
          name: product.name || 'Neznámý produkt',
          description: product.description || '',
          price: product.price || 0,
          category: product.category || '',
          imageUrl: product.imageUrl || '',
          tags: [],
          externalUrl: product.externalUrl || '',
          hasTrial: !!product.hasTrial
        } as BriefProduct
      }
    })
    
    return NextResponse.json({ 
      products: processedProducts,
      count: processedProducts.length,
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