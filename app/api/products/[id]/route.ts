import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Helper function to verify company JWT token
function verifyCompanyToken(request: NextRequest) {
  const token = request.cookies.get('advertiser-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, (() => { const v = process.env.JWT_SECRET; if (!v) throw new Error('JWT_SECRET is required'); return v })()) as any
    return decoded
  } catch (error) {
    return null
  }
}

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
    
    // Zjistit typ uživatele - super admin vs company admin
    const session = await getServerSession(authOptions)
    const companyUser = verifyCompanyToken(request)
    
    const isSuperAdmin = session?.user?.email === 'admin@admin.com'
    const isCompanyAdmin = !!companyUser && !isSuperAdmin
    
    // Dočasně povolit v development režimu bez autentifikace pro admin rozhraní
    const isDevelopmentAdmin = process.env.NODE_ENV === 'development' && request.headers.get('referer')?.includes('/admin/')
    
    if (!isSuperAdmin && !isCompanyAdmin && !isDevelopmentAdmin) {
      console.log('🔧 DEBUG: Authorization failed', { 
        isSuperAdmin, 
        isCompanyAdmin, 
        isDevelopmentAdmin,
        sessionEmail: session?.user?.email,
        referer: request.headers.get('referer')
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('🔧 DEBUG: Authorization passed', { 
      isSuperAdmin, 
      isCompanyAdmin, 
      isDevelopmentAdmin 
    })
    
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

    // Zkontrolovat oprávnění pro company admin - pouze jejich přiřazený produkt
    // ✅ ADMIN INTERFACE - bez omezení pro development admin
    if (isCompanyAdmin && !isDevelopmentAdmin) {
      const company = await prisma.company.findUnique({
        where: { id: companyUser.companyId },
        select: { assignedProductId: true, name: true }
      })
      
      if (!company || company.assignedProductId !== productId) {
        return NextResponse.json(
          { error: 'You can only edit your assigned product' },
          { status: 403 }
        )
      }
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
    
    if (isSuperAdmin || isDevelopmentAdmin) {
      // SUPER ADMIN - přímé ukládání bez schvalování
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
      
      console.log('✅ Product saved by admin:', productId, isSuperAdmin ? '(super admin)' : '(development admin)')
      
      return NextResponse.json({
        success: true,
        product: savedProduct,
        message: 'Product updated successfully.'
      })
      
    } else if (isCompanyAdmin) {
      // COMPANY ADMIN - ukládání jako pending changes
      
      // Připravit pending changes (všechny změny kromě obrázku)
      const pendingChanges = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category: updatedProduct.category,
        detailInfo: updatedProduct.detailInfo,
        externalUrl: updatedProduct.externalUrl,
        hasTrial: updatedProduct.hasTrial,
        tags: updatedProduct.tags,
        advantages: updatedProduct.advantages,
        disadvantages: updatedProduct.disadvantages,
        videoUrls: updatedProduct.videoUrls,
        pricingInfo: updatedProduct.pricingInfo
      }
      
      const pendingUpdateData: any = {
        hasPendingChanges: true,
        pendingChanges: JSON.stringify(pendingChanges),
        changesSubmittedAt: new Date(),
        changesSubmittedBy: companyUser.companyId,
        changesStatus: 'pending',
        adminNotes: null,
        changesApprovedAt: null,
        changesApprovedBy: null
      }
      
      // Zpracovat obrázek - pokud se změnil, nastavit jako pending
      if (imageChanged) {
        pendingUpdateData.pendingImageUrl = updatedProduct.imageUrl
        pendingUpdateData.imageApprovalStatus = 'pending'
      }
      
      // Uložit pending changes
      const savedProduct = await prisma.product.update({
        where: { id: productId },
        data: pendingUpdateData
      })
      
      console.log('⏳ Product changes submitted for approval by company:', companyUser.companyId, 'Product:', productId)
      
      return NextResponse.json({
        success: true,
        product: savedProduct,
        message: 'Changes submitted for approval. They will be reviewed by our admin team.',
        isPending: true
      })
    }
    
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
    // Zkontrolovat oprávnění - pouze super admin může mazat produkty
    const session = await getServerSession(authOptions)
    const isSuperAdmin = session?.user?.email === 'admin@admin.com'
    
    // Dočasně povolit v development režimu bez autentifikace pro admin rozhraní
    const isDevelopmentAdmin = process.env.NODE_ENV === 'development' && request.headers.get('referer')?.includes('/admin/')
    
    if (!isSuperAdmin && !isDevelopmentAdmin) {
      console.log('🔧 DEBUG: Delete authorization failed', { 
        isSuperAdmin, 
        isDevelopmentAdmin,
        sessionEmail: session?.user?.email,
        referer: request.headers.get('referer')
      })
      return NextResponse.json(
        { error: 'Unauthorized - only super admin can delete products' },
        { status: 403 }
      )
    }
    
    console.log('🔧 DEBUG: Delete authorization passed', { 
      isSuperAdmin, 
      isDevelopmentAdmin 
    })
    
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

    // Získat email přihlášeného admina ze session
    const adminEmail = session?.user?.email || (isDevelopmentAdmin ? 'development@admin.com' : 'admin@example.com')

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