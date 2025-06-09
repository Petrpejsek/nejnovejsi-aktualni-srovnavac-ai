import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// DELETE - Smazat celou historii kliků uživatele
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Najít uživatele
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Smazat celou historii kliků uživatele
    const deletedCount = await prisma.clickHistory.deleteMany({
      where: {
        userId: user.id
      }
    })

    console.log(`🗑️ Cleared click history for user: ${session.user.email}, deleted: ${deletedCount.count} items`)

    return NextResponse.json({ 
      message: 'Click history cleared successfully',
      deletedCount: deletedCount.count 
    })
  } catch (error) {
    console.error('Error clearing click history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 