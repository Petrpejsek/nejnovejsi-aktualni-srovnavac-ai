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
    
    // Zpracovat obrázek
    if (imageChanged) {
      // Nová fotka se uloží jako čekající na schválení
      updateData.pendingImageUrl = updatedProduct.imageUrl
      updateData.imageApprovalStatus = 'pending'
      
      // Zachovat původní fotku dokud se nová neschválí
      if (currentProduct.imageUrl && !updatedProduct.imageUrl.startsWith('data:')) {
        updateData.imageUrl = currentProduct.imageUrl
      } else {
        updateData.imageUrl = updatedProduct.imageUrl
      }
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
      message: imageChanged 
        ? 'Product updated successfully. Image is pending approval.' 
        : 'Product updated successfully.'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
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
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    )
  }
} 