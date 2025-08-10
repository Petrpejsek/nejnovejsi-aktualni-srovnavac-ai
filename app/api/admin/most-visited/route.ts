import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || '7d').toLowerCase()
    const daysMap: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[range] ?? 7

    const since = new Date()
    since.setDate(since.getDate() - days)

    // Top stránky podle počtu zobrazení za období
    const pageViews = await prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: since } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 50
    })

    // Kliky podle pagePath ve stejném období – CTR základ
    const clicksByPage = await prisma.click.groupBy({
      by: ['pagePath'],
      where: { createdAt: { gte: since }, pagePath: { not: null } },
      _count: { pagePath: true }
    })

    const clicksMap = new Map<string, number>()
    for (const row of clicksByPage) {
      if (row.pagePath) clicksMap.set(row.pagePath, Number(row._count.pagePath))
    }

    const result = pageViews.map((row) => {
      const page = row.path
      const views = Number(row._count.path)
      const clicks = clicksMap.get(page) || 0
      const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0 // jedno desetinné místo
      return { page, views, clicks, ctr }
    })

    return NextResponse.json({ range, days, items: result })
  } catch (error) {
    console.error('Error fetching most visited pages:', error)
    return NextResponse.json({ error: 'Failed to fetch most visited' }, { status: 500 })
  }
}


