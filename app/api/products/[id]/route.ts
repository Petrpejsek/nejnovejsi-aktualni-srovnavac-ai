import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    
    // Simulace načtení produktu z databáze
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      }
    })

    if (!product) {
      return new NextResponse(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    console.log('Loaded product:', product)
    
    // Formátování dat pro front-end - zpracovat JSON pole
    const formattedProduct = {
      ...product,
      tags: product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [],
      advantages: product.advantages ? (typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages) : [],
      disadvantages: product.disadvantages ? (typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages) : [],
      videoUrls: product.videoUrls ? (typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls) : [],
      pricingInfo: product.pricingInfo ? (typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo) : { basic: '0', pro: '0', enterprise: '0' }
    }
    
    return new NextResponse(JSON.stringify(formattedProduct), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch product' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const updatedProduct = await request.json()
    
    // Aktuální produkt
    const currentProduct = await prisma.product.findUnique({
      where: {
        id: productId
      }
    })
    
    if (!currentProduct) {
      return new NextResponse(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // Zjistit, zda se změnila fotka
    const imageChanged = updatedProduct.imageUrl !== currentProduct.imageUrl
    
    // Připravit data pro uložení do databáze
    const updateData: any = {
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      category: updatedProduct.category,
      detailInfo: updatedProduct.detailInfo,
      externalUrl: updatedProduct.externalUrl,
      hasTrial: updatedProduct.hasTrial,
      // JSON pole - uložit jako stringy
      tags: updatedProduct.tags,
      advantages: updatedProduct.advantages,
      disadvantages: updatedProduct.disadvantages,
      videoUrls: updatedProduct.videoUrls,
      pricingInfo: updatedProduct.pricingInfo
    }
    
    // Zpracovat obrázek - v super adminu se ukládá přímo bez schvalování
    if (imageChanged) {
      updateData.imageUrl = updatedProduct.imageUrl
      updateData.pendingImageUrl = null
      updateData.imageApprovalStatus = null
    } else {
      updateData.imageUrl = updatedProduct.imageUrl
    }
    
    // Uložit do databáze
    const savedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData
    })
    
    console.log('Product saved successfully:', productId)
    console.log('Image changed:', imageChanged)
    
    return NextResponse.json({
      success: true,
      product: savedProduct,
      message: 'Product updated successfully.'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Soft delete a product (mark as inactive)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Zkontroluj, jestli produkt existuje a je aktivní
    const product = await prisma.product.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      },
      select: { id: true, name: true, imageUrl: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nenalezen nebo už byl smazán' },
        { status: 404 }
      )
    }

    // TODO: Získat email přihlášeného admina ze session
    const adminEmail = 'admin@example.com' // Placeholder

    // Soft delete - označit jako neaktivní
    await prisma.product.update({
      where: { id: params.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: adminEmail
      }
    })
    
    console.log(`🗑️ Produkt označen jako smazaný: ${product.name} (ID: ${params.id})`)

    return NextResponse.json({
      success: true,
      message: `Produkt "${product.name}" byl přesunut do koše`,
      canRestore: true // Indikace, že může být obnoven
    })

  } catch (error) {
    console.error('❌ Chyba při mazání produktu:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru při mazání produktu' },
      { status: 500 }
    )
  }
} 