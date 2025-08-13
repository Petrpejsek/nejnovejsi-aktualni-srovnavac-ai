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
    const range = searchParams.get('range') || '90d'
    const status = searchParams.get('status') || undefined
    const forCsv = searchParams.get('format') === 'csv'

    const ts = parseRange(range)
    const where: any = { companyId, type: 'payout' }
    if (ts.gte) where.createdAt = { gte: ts.gte }
    if (status) where.status = status

    const rows = await prisma.billingRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: forCsv ? 100000 : 500,
      select: { id: true, createdAt: true, amount: true, status: true }
    })

    if (forCsv) {
      const header = ['timestamp','amount','status'].join(',')
      const lines = rows.map(r => [r.createdAt.toISOString(), String(r.amount ?? ''), r.status || ''].join(','))
      return new NextResponse([header, ...lines].join('\n'), { headers: { 'Content-Type': 'text/csv' } })
    }

    return NextResponse.json({ items: rows })
  } catch (e) {
    console.error('payouts list error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


