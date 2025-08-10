import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100)
    const category = searchParams.get('category') || undefined
    const q = searchParams.get('q') || undefined

    const where: any = {}
    if (category) {
      where.category = { slug: category }
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
      ]
    }

    const prompts = await prisma.prompt.findMany({
      where,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { salesCount: 'desc' }, { createdAt: 'desc' }],
      include: { category: true },
    })

    return NextResponse.json({ items: prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}


