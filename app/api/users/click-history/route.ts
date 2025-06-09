import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering to fix Vercel build error with headers()
export const dynamic = 'force-dynamic'

// GET - Načíst historii kliků uživatele
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Načíst historii kliků uživatele
    const clickHistory = await prisma.clickHistory.findMany({
      where: {
        User: {
          email: session.user.email
        }
      },
      orderBy: {
        clickedAt: 'desc'
      }
    })

    console.log(`🔍 Click history loaded for user: ${session.user.email}, count: ${clickHistory.length}`)

    return NextResponse.json(clickHistory)
  } catch (error) {
    console.error('Error loading click history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Přidat nový klik do historie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, productName, category, imageUrl, price, externalUrl } = await request.json()

    if (!productId || !productName) {
      return NextResponse.json({ error: 'Product ID and name are required' }, { status: 400 })
    }

    // Najít uživatele
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Přidat klik do historie (bez kontroly duplicit - chceme zaznamenat každý klik)
    const clickHistory = await prisma.clickHistory.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        productId,
        productName,
        category: category || null,
        imageUrl: imageUrl || null,
        price: price || null,
        externalUrl: externalUrl || null
      }
    })

    console.log(`✅ Click recorded for user: ${session.user.email}, product: ${productName}`)

    return NextResponse.json(clickHistory)
  } catch (error) {
    console.error('Error recording click:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 