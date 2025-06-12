import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// DELETE - Smazat konkrétní historie item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ DELETE HISTORY ITEM: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const historyItemId = params.id
    console.log('🗑️ DELETE HISTORY ITEM API: Removing item:', historyItemId, 'for user:', session.user.email)

    // Najít uživatele
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ DELETE HISTORY ITEM: User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Smazat konkrétní history item pouze pokud patří tomuto uživateli
    const deleteResult = await prisma.clickHistory.deleteMany({
      where: {
        id: historyItemId,
        userId: user.id  // Bezpečnostní kontrola - pouze vlastní záznamy
      }
    })

    if (deleteResult.count === 0) {
      console.log('❌ DELETE HISTORY ITEM: Item not found or not owned by user')
      return NextResponse.json({ error: 'History item not found' }, { status: 404 })
    }

    console.log(`✅ DELETE HISTORY ITEM: Successfully deleted item ${historyItemId} for user: ${session.user.email}`)

    return NextResponse.json({ 
      message: 'History item deleted successfully',
      deletedId: historyItemId
    })
  } catch (error) {
    console.error('❌ DELETE HISTORY ITEM: Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 