import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

// GET /api/products/[id] - Získat jeden produkt
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Načítám detail produktu s ID:', params.id)
    
    const product = await prisma.product.findUnique({
      where: {
        id: params.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nebyl nalezen' },
        { status: 404 }
      )
    }

    // Zpracování JSON dat
    const processedProduct = {
      ...product,
      tags: product.tags ? JSON.parse(product.tags) : [],
      advantages: product.advantages ? JSON.parse(product.advantages) : [],
      disadvantages: product.disadvantages ? JSON.parse(product.disadvantages) : [],
      pricingInfo: product.pricingInfo ? JSON.parse(product.pricingInfo) : {},
      videoUrls: product.videoUrls ? JSON.parse(product.videoUrls) : []
    }

    return NextResponse.json(processedProduct)
  } catch (error) {
    console.error('Chyba při načítání produktu:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Aktualizovat produkt
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    console.log('Přijatá data pro aktualizaci:', data) // Pro debugování

    // Explicitně zpracujeme externalUrl
    const externalUrl = data.externalUrl === '' ? null : data.externalUrl

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? parseFloat(data.price?.toString() || "0") : undefined,
        category: data.category,
        imageUrl: data.imageUrl,
        tags: data.tags !== undefined ? (typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || [])) : undefined,
        advantages: data.advantages !== undefined ? (typeof data.advantages === 'string' ? data.advantages : JSON.stringify(data.advantages || [])) : undefined,
        disadvantages: data.disadvantages !== undefined ? (typeof data.disadvantages === 'string' ? data.disadvantages : JSON.stringify(data.disadvantages || [])) : undefined,
        detailInfo: data.detailInfo,
        pricingInfo: data.pricingInfo !== undefined ? (typeof data.pricingInfo === 'string' ? data.pricingInfo : JSON.stringify(data.pricingInfo || {})) : undefined,
        videoUrls: data.videoUrls !== undefined ? (typeof data.videoUrls === 'string' ? data.videoUrls : JSON.stringify(data.videoUrls || [])) : undefined,
        externalUrl: externalUrl,
        hasTrial: data.hasTrial !== undefined ? Boolean(data.hasTrial) : undefined
      },
    })

    console.log('Aktualizovaný produkt:', product) // Pro debugování
    return NextResponse.json(product)
  } catch (error) {
    console.error('Chyba při aktualizaci produktu:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci produktu' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Smazat produkt
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Chyba při mazání produktu:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání produktu' },
      { status: 500 }
    )
  }
} 