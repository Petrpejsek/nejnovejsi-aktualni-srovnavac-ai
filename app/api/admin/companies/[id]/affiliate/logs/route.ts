import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(500, parseInt(searchParams.get('limit') || '100'))
    const items = await prisma.webhookLog.findMany({
      where: { endpoint: { contains: '/affiliate' } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        requestId: true,
        method: true,
        endpoint: true,
        statusCode: true,
        error: true,
        details: true,
        secretId: true,
        createdAt: true,
      }
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('affiliate logs GET error', e)
    return NextResponse.json({ items: [] })
  }
}


