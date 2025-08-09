import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { productId } = await request.json()
    
    // Získáme nebo vytvoříme visitorId z cookies
    const cookieStore = cookies()
    let visitorId = cookieStore.get('visitorId')?.value

    if (!visitorId) {
      // Pokud visitorId neexistuje, vytvoříme nové
      visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36)
      cookieStore.set('visitorId', visitorId, {
        maxAge: 60 * 60 * 24 * 30, // 30 dní
        path: '/',
      })
    }

    // Získáme IP adresu z requestu
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

    // Uložíme klik do databáze včetně aktuální cesty (pro CTR per page)
    const url = new URL(request.url)
    let pagePath = url.searchParams.get('pagePath') || undefined
    if (!pagePath) {
      const referer = request.headers.get('referer') || ''
      if (referer) {
        try {
          const { pathname } = new URL(referer)
          pagePath = pathname
        } catch {}
      }
    }
    await prisma.click.create({
      data: ({
        productId,
        visitorId,
        ipAddress,
        pagePath: pagePath ?? null,
      } as any)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving click:', error)
    return NextResponse.json({ error: 'Failed to save click' }, { status: 500 })
  }
}

// Endpoint pro získání statistik
export async function GET(request: NextRequest) {
  try {
    // Volitelný časový rozsah
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || '7d').toLowerCase()
    const daysMap: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[range] ?? 7

    const since = new Date()
    since.setDate(since.getDate() - days)

    const whereClause = { createdAt: { gte: since } } as const

    const totalClicks = await prisma.click.count({ where: whereClause })
    const uniqueVisitors = await prisma.click.groupBy({
      by: ['visitorId'],
      where: whereClause,
      _count: true,
    })

    const avgClicksPerDay = days > 0 ? Math.round(totalClicks / days) : 0

    return NextResponse.json({
      totalClicks,
      uniqueVisitors: uniqueVisitors.length,
      avgClicksPerDay,
      days,
      range
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

// Endpoint pro vynulování statistik
export async function DELETE() {
  try {
    await prisma.click.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting stats:', error)
    return NextResponse.json({ error: 'Failed to reset stats' }, { status: 500 })
  }
} 