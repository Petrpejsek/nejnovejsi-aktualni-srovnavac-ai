import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type RangeKey = 'all' | 'max' | '1d' | 'today' | 'yesterday' | '7d' | '28d' | '30d'

function startOfDay(d: Date): Date {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  return s
}

function parseRange(range: string | null): { gte?: Date; lt?: Date } {
  if (!range || range === 'all' || range === 'max') return {}
  const now = new Date()
  if (range === '1d' || range === 'today') {
    const gte = startOfDay(now)
    return { gte }
  }
  if (range === 'yesterday') {
    const startToday = startOfDay(now)
    const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000)
    return { gte: startYesterday, lt: startToday }
  }
  if (range === '7d') {
    return { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
  }
  if (range === '28d') {
    return { gte: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000) }
  }
  if (range === '30d') {
    return { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
  }
  return {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') as RangeKey) || 'all'
    const singlePath = searchParams.get('path')
    const pathsParam = searchParams.get('paths')
    const prefix = searchParams.get('prefix')

    const whereCreatedAt = parseRange(range)

    // If prefix is provided, return total count for all paths starting with prefix
    if (prefix) {
      const where: any = {
        path: { startsWith: prefix },
        ...(whereCreatedAt.gte || whereCreatedAt.lt ? { createdAt: whereCreatedAt as any } : {}),
      }
      const total = await prisma.pageView.count({ where })
      return NextResponse.json({ range, total })
    }

    const paths: string[] = []
    if (singlePath) paths.push(singlePath)
    if (pathsParam) paths.push(...pathsParam.split(',').map(s => s.trim()).filter(Boolean))

    if (paths.length === 0) {
      return NextResponse.json({ error: 'Missing path or paths query param or prefix' }, { status: 400 })
    }

    // Prisma groupBy per path
    const grouped = await prisma.pageView.groupBy({
      by: ['path'],
      where: {
        path: { in: paths },
        ...(whereCreatedAt.gte || whereCreatedAt.lt ? { createdAt: whereCreatedAt as any } : {}),
      },
      _count: { _all: true },
    })

    const counts: Record<string, number> = {}
    for (const g of grouped) {
      counts[g.path] = g._count._all
    }

    // Fill zero for missing paths
    for (const p of paths) if (!(p in counts)) counts[p] = 0

    return NextResponse.json({ range, counts })
  } catch (error) {
    console.error('Error in /api/pageview/stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}


