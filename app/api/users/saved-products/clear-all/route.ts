import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE - vymazání všech uložených produktů
export async function DELETE(request: NextRequest) {
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

    // Vymaže všechny uložené produkty uživatele
    const result = await prisma.savedProduct.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({ 
      message: 'All saved products cleared successfully',
      deletedCount: result.count 
    })
    
  } catch (error) {
    console.error('Error clearing all saved products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 