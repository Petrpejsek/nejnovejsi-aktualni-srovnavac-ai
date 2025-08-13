import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseRange(range: string | null): { gte?: Date } {
  const now = new Date()
  if (!range || range === 'all') return {}
  if (range === 'today') return { gte: new Date(now.setHours(0, 0, 0, 0)) }
  if (range === '7d') return { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) }
  if (range === '30d') return { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) }
  if (range === '90d') return { gte: new Date(Date.now() - 90 * 24 * 3600 * 1000) }
  return {}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = params.id
    const range = searchParams.get('range') || '30d'
    const type = searchParams.get('type') || undefined
    const status = searchParams.get('status') || undefined
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const amountMin = searchParams.get('amountMin')
    const amountMax = searchParams.get('amountMax')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(200, parseInt(searchParams.get('pageSize') || '50'))
    const forCsv = searchParams.get('format') === 'csv'

    const ts = parseRange(range)
    const where: any = { companyId }
    if (ts.gte) where.createdAt = { gte: ts.gte }
    if (from) where.createdAt = { ...(where.createdAt || {}), gte: new Date(from) }
    if (to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(to) }
    if (type) where.type = type
    if (status) where.status = status
    if (amountMin) where.amount = { ...(where.amount || {}), gte: Number(amountMin) }
    if (amountMax) where.amount = { ...(where.amount || {}), lte: Number(amountMax) }

    const [totalCount, rows] = await Promise.all([
      prisma.billingRecord.count({ where }),
      prisma.billingRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: forCsv ? 100000 : pageSize,
        select: {
          id: true,
          createdAt: true,
          type: true,
          amount: true,
          description: true,
          status: true,
          paymentMethod: true,
          invoiceNumber: true,
          invoiceUrl: true,
        }
      })
    ])

    if (forCsv) {
      const header = ['timestamp','type','amount','status','paymentMethod','invoiceNumber','description'].join(',')
      const lines = rows.map(r => [
        r.createdAt.toISOString(), r.type, String(r.amount ?? ''), r.status ?? '', r.paymentMethod ?? '', r.invoiceNumber ?? '', (r.description ?? '').replace(/[,\n]/g, ' ')
      ].join(','))
      return new NextResponse([header, ...lines].join('\n'), { headers: { 'Content-Type': 'text/csv' } })
    }

    return NextResponse.json({
      pagination: { page, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
      items: rows,
    })
  } catch (e) {
    console.error('billing transactions error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


