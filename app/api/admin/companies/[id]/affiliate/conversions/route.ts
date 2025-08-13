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
    const status = searchParams.get('status') || undefined
    const ref_code = searchParams.get('ref_code') || undefined
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const billed = searchParams.get('billed')
    const paid = searchParams.get('paid')
    const q = searchParams.get('q') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(1000, parseInt(searchParams.get('pageSize') || '50'))
    const forCsv = searchParams.get('format') === 'csv'

    const timestampRange = parseRange(range)
    const where: any = {
      partner_id: partnerId,
      ...(timestampRange.gte ? { timestamp: { gte: timestampRange.gte } } : {}),
      ...(timestampRange.lte ? { timestamp: { lte: timestampRange.lte } } : {}),
      ...(ref_code ? { ref_code } : {}),
    }

    if (status) {
      // status je v metadata JSON (např. { status: 'pending'|'approved'|'reversed'|'paid' })
      where.metadata = { contains: `"status":"${status}"` }
    }
    if (typeof billed === 'string') {
      if (billed === 'true') where.billed_at = { not: null }
      if (billed === 'false') where.billed_at = null
    }
    if (typeof paid === 'string') {
      // paid_at je ukládáno v metadata jako paid_at timestamp
      if (paid === 'true') where.metadata = { contains: '"paid_at"' }
      if (paid === 'false') where.metadata = { not: { contains: '"paid_at"' } }
    }
    if (from) where.timestamp = { ...(where.timestamp || {}), gte: new Date(from) }
    if (to) where.timestamp = { ...(where.timestamp || {}), lte: new Date(to) }
    if (q) where.external_conversion_id = { contains: q }

    const [totalCount, rows, totals] = await Promise.all([
      prisma.affiliate_conversions.count({ where }),
      prisma.affiliate_conversions.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * pageSize,
        take: forCsv ? Math.min(100000, pageSize) : pageSize,
        select: {
          id: true,
          ref_code: true,
          partner_id: true,
          monetizable_type: true,
          monetizable_id: true,
          conversion_type: true,
          conversion_value: true,
          commission_rate: true,
          commission_amount: true,
          timestamp: true,
          attribution_window_hours: true,
          session_id: true,
          external_conversion_id: true,
          currency: true,
          billed_at: true,
          invoice_id: true,
          is_billable: true,
          metadata: true,
        }
      }),
      prisma.affiliate_conversions.aggregate({
        where,
        _sum: {
          conversion_value: true,
          commission_amount: true,
        },
        _count: { _all: true }
      })
    ])

    if (forCsv) {
      const header = [
        'id','ref_code','external_conversion_id','monetizable_type','monetizable_id','revenue','commission','rate','status','timestamp','billed_at','invoice_id','currency','session_id'
      ].join(',')
      const lines = rows.map(r => {
        let statusText: string | undefined
        try {
          statusText = JSON.parse(r.metadata || '{}')?.status
        } catch {}
        return [
          r.id,
          r.ref_code,
          r.external_conversion_id || '',
          r.monetizable_type,
          r.monetizable_id,
          String(r.conversion_value ?? ''),
          String(r.commission_amount ?? ''),
          String(r.commission_rate ?? ''),
          statusText || '',
          r.timestamp.toISOString(),
          r.billed_at ? r.billed_at.toISOString() : '',
          r.invoice_id || '',
          r.currency,
          r.session_id || ''
        ].map(v => String(v).replace(/"/g,'"')).join(',')
      })
      const csv = [header, ...lines].join('\n')
      return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv' } })
    }

    return NextResponse.json({
      pagination: { page, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
      totals: {
        revenue: Number(totals._sum.conversion_value || 0),
        commission: Number(totals._sum.commission_amount || 0),
        count: totals._count._all || 0,
      },
      items: rows,
    })
  } catch (e) {
    console.error('affiliate conversions GET error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


