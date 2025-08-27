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
    const { searchParams } = new URL(request.url)
    const includeMeta = searchParams.get('meta') === '1' || searchParams.get('includeMeta') === 'true'
    
    // Simulace načtení produktu z databáze
    const product = await prisma.product.findUnique({
      where: { id: productId }
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

    // Load additional categories via join table
    const additionalJoins = await prisma.productCategory.findMany({
      where: { productId },
      select: { categoryId: true, category: { select: { id: true, name: true, slug: true } } }
    })
    
    // Formátování dat pro front-end - zpracovat JSON pole
    const formattedProduct: any = {
      ...product,
      tags: product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [],
      advantages: product.advantages ? (typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages) : [],
      disadvantages: product.disadvantages ? (typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages) : [],
      videoUrls: product.videoUrls ? (typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls) : [],
      pricingInfo: product.pricingInfo ? (typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo) : { basic: '0', pro: '0', enterprise: '0' },
      additionalCategories: additionalJoins.map(j => ({ id: j.category.id, name: j.category.name, slug: j.category.slug }))
    }

    // Optionally include meta fields for audit/debugging (admin/dev usage)
    if (includeMeta) {
      formattedProduct.__meta = {
        hasPendingChanges: (product as any).hasPendingChanges ?? null,
        changesStatus: (product as any).changesStatus ?? null,
        changesSubmittedBy: (product as any).changesSubmittedBy ?? null,
        changesApprovedBy: (product as any).changesApprovedBy ?? null,
        adminNotes: (product as any).adminNotes ?? null,
        updatedAt: product.updatedAt ?? null,
        imageApprovalStatus: (product as any).imageApprovalStatus ?? null,
        pendingImageUrl: (product as any).pendingImageUrl ?? null
      }
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
    
    // Robust admin detection: respect session role/isAdmin, keep legacy email fallback
    const isSessionAdmin = Boolean((session as any)?.user?.isAdmin) || (session as any)?.user?.role === 'admin'
    const isLegacyEmailAdmin = (session as any)?.user?.email === 'admin@admin.com'
    const isSuperAdmin = isSessionAdmin || isLegacyEmailAdmin
    const isCompanyAdmin = !!companyUser && !isSuperAdmin
    
    // Dočasně povolit v development režimu bez autentifikace pro admin rozhraní
    const isDevelopmentAdmin = process.env.NODE_ENV === 'development' && request.headers.get('referer')?.includes('/admin/')
    
    if (!isSuperAdmin && !isCompanyAdmin && !isDevelopmentAdmin) {
      console.log('🔧 DEBUG: Authorization failed', { 
        isSuperAdmin, 
        isCompanyAdmin, 
        isDevelopmentAdmin,
        sessionEmail: session?.user?.email,
        sessionRole: (session as any)?.user?.role,
        sessionIsAdmin: (session as any)?.user?.isAdmin,
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
      isDevelopmentAdmin,
      sessionEmail: session?.user?.email,
      sessionRole: (session as any)?.user?.role,
      sessionIsAdmin: (session as any)?.user?.isAdmin
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
      
      // Handle additional categories (ids or names)
      const parseAdditionalCategoryIds = async (): Promise<string[] | null> => {
        try {
          if (Array.isArray(updatedProduct.additionalCategoryIds)) {
            return updatedProduct.additionalCategoryIds.filter((s: any) => typeof s === 'string' && s.trim())
          }
          if (Array.isArray(updatedProduct.additionalCategories)) {
            // Could be array of strings (names) or objects with id
            const arr = updatedProduct.additionalCategories
            if (arr.length === 0) return []
            if (typeof arr[0] === 'string') {
              const names: string[] = arr.map((n: string) => String(n).trim()).filter(Boolean)
              if (names.length === 0) return []
              const found = await prisma.category.findMany({
                where: { name: { in: names, mode: 'insensitive' } },
                select: { id: true, name: true }
              })
              const foundMap = new Map(found.map(c => [c.name.toLowerCase(), c.id]))
              const missing = names.filter(n => !foundMap.has(n.toLowerCase()))
              if (missing.length > 0) {
                throw new Error(`Unknown categories: ${missing.join(', ')}`)
              }
              return names.map(n => foundMap.get(n.toLowerCase())!)
            }
            if (arr[0] && typeof arr[0] === 'object' && 'id' in arr[0]) {
              return arr.map((o: any) => String(o.id)).filter(Boolean)
            }
          }
        } catch (e) {
          throw e
        }
        return null
      }

      const desiredAdditionalIds = await parseAdditionalCategoryIds()

      // Uložit do databáze (včetně joinů)
      const savedProduct = await prisma.$transaction(async (tx) => {
        const p = await tx.product.update({ where: { id: productId }, data: updateData })
        if (desiredAdditionalIds !== null) {
          await tx.productCategory.deleteMany({ where: { productId } })
          if (desiredAdditionalIds.length > 0) {
            await tx.productCategory.createMany({
              data: desiredAdditionalIds.map((cid: string) => ({ id: crypto.randomUUID(), productId, categoryId: cid })),
              skipDuplicates: true
            })
          }
        }
        return p
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