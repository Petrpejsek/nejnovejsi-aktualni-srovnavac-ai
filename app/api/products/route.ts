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
    console.log('Načítám produkty...')
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Zpracování dat před odesláním
    const processedProducts = products.map((product) => ({
      ...product,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags || [],
      advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages || [],
      disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages || [],
      pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo || {},
      videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls || [],
      // Zajistíme, že externalUrl není JSON string
      externalUrl: product.externalUrl?.startsWith('"') && product.externalUrl?.endsWith('"') 
        ? JSON.parse(product.externalUrl) 
        : product.externalUrl,
      hasTrial: product.hasTrial || false
    }))

    console.log('Zpracované produkty:', processedProducts)
    return NextResponse.json(processedProducts)
  } catch (error) {
    console.error('Chyba při načítání produktů:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání produktů' },
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