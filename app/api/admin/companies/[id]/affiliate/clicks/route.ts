import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseRange(range: string | null): { gte?: Date; lte?: Date } {
  const now = new Date()
  if (!range || range === 'all') return {}
  if (range === 'today') return { gte: new Date(now.setHours(0, 0, 0, 0)) }
  if (range === 'yesterday') {
    const start = new Date(now)
    start.setDate(start.getDate() - 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    return { gte: start, lte: end }
  }
  if (range === '7d') return { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  if (range === '30d') return { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  if (range === '90d') return { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  return {}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerId = params.id
    const range = searchParams.get('range') || '7d'
    const ref_code = searchParams.get('ref_code') || undefined
    const valid = searchParams.get('valid')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(1000, parseInt(searchParams.get('pageSize') || '50'))

    const timestampRange = parseRange(range)
    const where: any = {
      partner_id: partnerId,
      ...(timestampRange.gte ? { timestamp: { gte: timestampRange.gte } } : {}),
      ...(timestampRange.lte ? { timestamp: { lte: timestampRange.lte } } : {}),
      ...(ref_code ? { ref_code } : {}),
    }
    if (typeof valid === 'string') {
      where.is_valid = valid === 'true'
    }

    const [totalCount, rows] = await Promise.all([
      prisma.affiliate_clicks.count({ where }),
      prisma.affiliate_clicks.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          ref_code: true,
          country: true,
          user_agent: true,
          is_valid: true,
          fraud_reason: true,
          timestamp: true,
          session_id: true,
          monetizable_type: true,
          monetizable_id: true,
        }
      })
    ])

    return NextResponse.json({
      pagination: { page, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
      items: rows,
    })
  } catch (e) {
    console.error('affiliate clicks GET error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const id = data?.id as string
    const isValid = data?.is_valid as boolean | undefined
    const fraudReason = data?.fraud_reason as string | undefined
    if (!id || typeof isValid !== 'boolean') {
      return NextResponse.json({ error: 'id and is_valid required' }, { status: 400 })
    }
    await prisma.affiliate_clicks.update({
      where: { id },
      data: { is_valid: isValid, fraud_reason: fraudReason }
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('affiliate clicks PUT error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


