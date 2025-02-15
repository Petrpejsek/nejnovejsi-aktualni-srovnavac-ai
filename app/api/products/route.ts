import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

// GET /api/products - Získat všechny produkty
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`API: Načteno ${products.length} produktů`)  // Pro debugging
    
    if (!products || products.length === 0) {
      console.warn('API: Žádné produkty nenalezeny')
      return NextResponse.json({ error: 'Žádné produkty nenalezeny' }, { status: 404 })
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('API: Chyba při načítání produktů:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru při načítání produktů' },
      { status: 500 }
    )
  }
}

// POST /api/products - Vytvořit nový produkt
export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Přijatá data pro vytvoření produktu:', data)

    // Kontrola povinných polí
    if (!data.name) {
      return NextResponse.json(
        { error: 'Název produktu je povinný' },
        { status: 400 }
      )
    }

    // Zpracování dat před uložením
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

    console.log('Zpracovaná data před uložením:', processedData)

    const product = await prisma.product.create({
      data: processedData
    })

    console.log('Vytvořený produkt:', product)
    
    // Zpracování dat pro odpověď
    const responseProduct = {
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      advantages: JSON.parse(product.advantages || '[]'),
      disadvantages: JSON.parse(product.disadvantages || '[]'),
      pricingInfo: JSON.parse(product.pricingInfo || '{}'),
      videoUrls: JSON.parse(product.videoUrls || '[]')
    }

    return NextResponse.json(responseProduct)
  } catch (error) {
    console.error('Chyba při vytváření produktu:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření produktu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 