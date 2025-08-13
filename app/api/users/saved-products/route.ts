import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering to fix Vercel build error with headers()
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// GET - získání uložených produktů
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Pagination params: 10 on first page, 20 on subsequent loads
    const search = new URL(request.url).searchParams
    const skip = Number.parseInt(search.get('skip') || '0', 10)
    const takeParam = search.get('take')
    const take = Number.isNaN(Number.parseInt(takeParam || '', 10))
      ? (skip === 0 ? 10 : 20)
      : Math.max(1, Number.parseInt(takeParam as string, 10))

    const [rowsPlusOne, total] = await Promise.all([
      prisma.savedProduct.findMany({
        where: { userId: user.id },
        orderBy: [
          { savedAt: 'desc' },
          { id: 'desc' }
        ],
        skip,
        take: take + 1
      }),
      prisma.savedProduct.count({ where: { userId: user.id } })
    ])

    const hasMore = rowsPlusOne.length > take
    const savedProducts = hasMore ? rowsPlusOne.slice(0, take) : rowsPlusOne

    // Načítáme kompletní data pro každý uložený produkt
    const enrichedProducts = await Promise.all(
      savedProducts.map(async (sp) => {
        const fullProduct = await prisma.product.findUnique({
          where: { id: sp.productId },
          select: {
            price: true,
            tags: true,
            externalUrl: true,
            imageUrl: true,
            category: true,
            description: true
          }
        })
        
        const result = {
          id: sp.id,
          productId: sp.productId,
          productName: sp.productName,
          category: sp.category || fullProduct?.category,
          imageUrl: sp.imageUrl || fullProduct?.imageUrl,
          savedAt: sp.savedAt.toLocaleDateString('en-US'),
          price: sp.price || 0, // ← POUŽIJEME ULOŽENOU CENU Z WEBU!
          tags: fullProduct?.tags || [],
          externalUrl: fullProduct?.externalUrl,
          description: fullProduct?.description || ''
        }
        
        console.log('🔍 Saved product data:', {
          name: result.productName,
          productId: result.productId, // ← PŘIDÁME DEBUG PRO PRODUCT ID
          price: result.price,
          description: result.description?.substring(0, 50) + '...',
          tags: result.tags,
          externalUrl: result.externalUrl
        })
        
        return result
      })
    )

    return NextResponse.json({ items: enrichedProducts, hasMore, nextSkip: hasMore ? skip + take : null, total })
    
  } catch (error) {
    console.error('Error fetching saved products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// POST - uložení produktu
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 SAVE PRODUCT API CALLED')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ SAVE API: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, productName, category, imageUrl, price } = await request.json()
    console.log('🔧 SAVE API: Received data:', { productId, productName, category, price, userEmail: session.user.email })

    if (!productId || !productName) {
      return NextResponse.json({ error: 'Product ID and name are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Zkontrolujeme, jestli produkt už není uložený
    const existingSave = await prisma.savedProduct.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    })

    if (existingSave) {
      return NextResponse.json({ error: 'Product already saved' }, { status: 409 })
    }

    // Uložíme produkt
    const savedProduct = await prisma.savedProduct.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        productId,
        productName,
        category: category || null,
        imageUrl: imageUrl || null,
        price: typeof price === 'number' ? price : 0
      }
    })

    return NextResponse.json(savedProduct)
    
  } catch (error) {
    console.error('Error saving product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - odstranění produktu
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('🚨 DELETE: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    console.log('🗑️ DELETE: Attempting to delete productId:', productId)

    if (!productId) {
      console.log('🚨 DELETE: Missing productId')
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      console.log('🚨 DELETE: User not found for email:', session.user.email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('🗑️ DELETE: Found user:', user.id, 'deleting product:', productId)

    // Odstraníme produkt
    const deleteResult = await prisma.savedProduct.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    })

    console.log('✅ DELETE: Successfully deleted product:', deleteResult)
    return NextResponse.json({ message: 'Product removed successfully' })
    
  } catch (error) {
    console.error('🚨 DELETE: Error removing product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 