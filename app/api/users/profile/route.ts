import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Najdeme uživatele v databázi
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Načteme uložené produkty samostatně
    const savedProducts = await prisma.savedProduct.findMany({
      where: { userId: user.id },
      orderBy: { savedAt: 'desc' }
    })

    // Připravíme data pro frontend
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      premium: user.premium,
      points: user.points,
      level: user.level,
      streak: user.streak,
      joinDate: user.joinDate.toLocaleDateString('en-US'),
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      toolsUsed: user.toolsUsed,
      favoriteTools: user.favoriteTools,
      achievements: user.achievements,
      preferences: user.preferences,
      settings: user.settings,
      savedProducts: await Promise.all(
        savedProducts.map(async (sp: any) => {
          // Načteme kompletní data produktu z databáze
          const fullProduct = await prisma.product.findUnique({
            where: { id: sp.productId },
            select: {
              id: true,
              name: true,
              imageUrl: true,
              price: true,
              tags: true,
              externalUrl: true,
              category: true,
              description: true
            }
          })
          
          return {
            id: sp.id,
            productId: sp.productId,
            productName: sp.productName,
            category: sp.category || fullProduct?.category,
            imageUrl: sp.imageUrl || fullProduct?.imageUrl,
            savedAt: sp.savedAt.toLocaleDateString('en-US'),
            // Přidáme nová data
            price: fullProduct?.price || 0,
            tags: fullProduct?.tags || [],
            externalUrl: fullProduct?.externalUrl,
            description: fullProduct?.description || ''
          }
        })
      ),
      savedProductsCount: savedProducts.length
    }

    return NextResponse.json(profileData)
    
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 