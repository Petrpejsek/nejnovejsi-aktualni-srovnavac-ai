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
    const processedProducts = products.map((product: Product) => ({
      ...product,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
      advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
      disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages,
      pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo,
      videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls,
      // Zajistíme, že externalUrl není JSON string
      externalUrl: product.externalUrl?.startsWith('"') && product.externalUrl?.endsWith('"') 
        ? JSON.parse(product.externalUrl) 
        : product.externalUrl
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
      console.error('Chybí název produktu')
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
      tags: typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || []),
      advantages: typeof data.advantages === 'string' ? data.advantages : JSON.stringify(data.advantages || []),
      disadvantages: typeof data.disadvantages === 'string' ? data.disadvantages : JSON.stringify(data.disadvantages || []),
      detailInfo: data.detailInfo || '',
      pricingInfo: typeof data.pricingInfo === 'string' ? data.pricingInfo : JSON.stringify(data.pricingInfo || {}),
      videoUrls: typeof data.videoUrls === 'string' ? data.videoUrls : JSON.stringify(data.videoUrls || []),
      externalUrl: data.externalUrl || null
    }

    console.log('Zpracovaná data před uložením:', processedData)

    const product = await prisma.product.create({
      data: processedData
    })

    console.log('Vytvořený produkt:', product)
    return NextResponse.json(product)
  } catch (error) {
    console.error('Chyba při vytváření produktu:', error)
    // Detailnější chybová hláška pro debugování
    return NextResponse.json(
      { error: 'Chyba při vytváření produktu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 