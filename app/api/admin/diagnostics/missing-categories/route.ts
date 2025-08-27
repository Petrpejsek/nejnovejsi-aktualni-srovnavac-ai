import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = Boolean((session as any)?.user?.isAdmin) || (session as any)?.user?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const missingWhere: any = {
      OR: [
        { category: null },
        { category: '' },
        { primary_category_id: null },
      ],
      isActive: true
    }

    const [count, items] = await Promise.all([
      prisma.product.count({ where: missingWhere }),
      prisma.product.findMany({
        where: missingWhere,
        select: { id: true, name: true, category: true, primary_category_id: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 100
      })
    ])

    return NextResponse.json({ success: true, count, items })
  } catch (error) {
    console.error('Diagnostics: missing categories failed:', error)
    return NextResponse.json({ success: false, error: 'Diagnostics failed' }, { status: 500 })
  }
}


