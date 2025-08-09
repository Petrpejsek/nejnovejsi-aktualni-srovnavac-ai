import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { v4 as uuid } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'
    const { referrer, userAgent } = await request.json().catch(() => ({ referrer: '', userAgent: '' }))

    const cookieStore = cookies()
    let visitorId = cookieStore.get('visitorId')?.value
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36)
      cookieStore.set('visitorId', visitorId, { maxAge: 60 * 60 * 24 * 30, path: '/' })
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

    await prisma.pageView.create({
      data: {
        id: uuid(),
        path,
        visitorId,
        referrer: referrer || null,
        userAgent: userAgent || null,
        country: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging pageview:', error)
    return NextResponse.json({ error: 'Failed to log pageview' }, { status: 500 })
  }
}


