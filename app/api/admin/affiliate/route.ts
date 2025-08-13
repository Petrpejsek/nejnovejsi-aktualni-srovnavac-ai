import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseRange(range: string | null): { gte?: Date } {
  const now = new Date()
  if (!range || range === 'all') return {}
  if (range === 'today') return { gte: new Date(now.setHours(0,0,0,0)) }
  if (range === '7d') return { gte: new Date(Date.now() - 7*24*60*60*1000) }
  if (range === '30d') return { gte: new Date(Date.now() - 30*24*60*60*1000) }
  if (range === '90d') return { gte: new Date(Date.now() - 90*24*60*60*1000) }
  return {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const createdAt = parseRange(range)

    const [clicks, conversions] = await Promise.all([
      prisma.affiliate_clicks.count({ where: { ...(createdAt.gte ? { timestamp: createdAt as any } : {}) } }),
      prisma.affiliate_conversions.findMany({
        where: { ...(createdAt.gte ? { timestamp: createdAt as any } : {}) },
        select: { commission_amount: true }
      })
    ])

    const commission = conversions.reduce((sum, c) => sum + (c.commission_amount || 0), 0)
    const cr = clicks > 0 ? (conversions.length / clicks) * 100 : 0

    const topPartners = await prisma.affiliate_clicks.groupBy({
      by: ['partner_id'],
      where: { ...(createdAt.gte ? { timestamp: createdAt as any } : {}) },
      _count: { _all: true }
    })

    const partnerConv = await prisma.affiliate_conversions.groupBy({
      by: ['partner_id'],
      where: { ...(createdAt.gte ? { timestamp: createdAt as any } : {}) },
      _count: { _all: true },
      _sum: { commission_amount: true }
    })

    const partners = topPartners.map(tp => {
      const conv = partnerConv.find(pc => pc.partner_id === tp.partner_id)
      return {
        partnerId: tp.partner_id,
        clicks: tp._count._all,
        conversions: conv?._count._all || 0,
        commission: Number(conv?._sum.commission_amount || 0)
      }
    }).sort((a,b)=>b.clicks-a.clicks).slice(0,10)

    const topRefs = await prisma.affiliate_clicks.groupBy({
      by: ['ref_code'],
      where: { ...(createdAt.gte ? { timestamp: createdAt as any } : {}) },
      _count: { _all: true }
    })
    const refConv = await prisma.affiliate_conversions.groupBy({
      by: ['ref_code'],
      where: { ...(createdAt.gte ? { timestamp: createdAt as any } : {}) },
      _count: { _all: true },
      _sum: { commission_amount: true }
    })
    const refs = topRefs.map(tr => {
      const conv = refConv.find(rc => rc.ref_code === tr.ref_code)
      return {
        refCode: tr.ref_code,
        clicks: tr._count._all,
        conversions: conv?._count._all || 0,
        commission: Number(conv?._sum.commission_amount || 0)
      }
    }).sort((a,b)=>b.clicks-a.clicks).slice(0,10)

    return NextResponse.json({
      range,
      totals: { clicks, conversions: conversions.length, commission, cr },
      topPartners: partners,
      topRefCodes: refs
    })
  } catch (e) {
    console.error('affiliate stats error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


