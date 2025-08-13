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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const createdAt = parseRange(range)
    const partnerId = params.id

    // CPC
    const cpcClicks = await prisma.ad_clicks_monetization.findMany({
      where: { partner_id: partnerId, ...(createdAt.gte ? { timestamp: createdAt as any } : {}), is_valid_click: true },
      select: { cost_per_click: true }
    })
    const cpcTotals = cpcClicks.reduce((acc, c)=>{acc.clicks+=1; acc.cost+=Number(c.cost_per_click||0); return acc}, {clicks:0,cost:0})
    const avgCpc = cpcTotals.clicks>0 ? cpcTotals.cost/cpcTotals.clicks : 0

    // Affiliate
    const [affClicks, conversions] = await Promise.all([
      prisma.affiliate_clicks.count({ where: { partner_id: partnerId, ...(createdAt.gte ? { timestamp: createdAt as any } : {}) } }),
      prisma.affiliate_conversions.findMany({ where: { partner_id: partnerId, ...(createdAt.gte ? { timestamp: createdAt as any } : {}) }, select: { commission_amount: true, is_billable: true, billed_at: true } })
    ])
    const commission = conversions.reduce((s,c)=>s+Number(c.commission_amount||0),0)
    const cr = affClicks>0 ? (conversions.length/affClicks)*100 : 0
    const unbilled = conversions.filter(c=>c.is_billable && !c.billed_at).reduce((s,c)=>s+Number(c.commission_amount||0),0)
    const billed = commission - unbilled

    return NextResponse.json({
      range,
      cpc: { clicks: cpcTotals.clicks, cost: cpcTotals.cost, avgCpc },
      affiliate: { clicks: affClicks, conversions: conversions.length, commission, cr, billed, unbilled },
    })
  } catch (e) {
    console.error('company overview error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


