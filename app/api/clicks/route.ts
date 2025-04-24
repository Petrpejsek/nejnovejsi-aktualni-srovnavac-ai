import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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

    // Uložíme klik do databáze
    await prisma.click.create({
      data: {
        productId,
        visitorId,
        ipAddress,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving click:', error)
    return NextResponse.json({ error: 'Failed to save click' }, { status: 500 })
  }
}

// Endpoint pro získání statistik
export async function GET() {
  try {
    const totalClicks = await prisma.click.count()
    const uniqueVisitors = await prisma.click.groupBy({
      by: ['visitorId'],
      _count: true,
    })

    return NextResponse.json({
      totalClicks,
      uniqueVisitors: uniqueVisitors.length,
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