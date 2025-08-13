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

    const clicks = await prisma.ad_clicks_monetization.findMany({
      where: { ...(createdAt.gte ? { timestamp: createdAt as any } : {}), is_valid_click: true },
      select: { cost_per_click: true, partner_id: true, monetizable_type: true, monetizable_id: true }
    })

    const totals = clicks.reduce((acc, c) => {
      acc.clicks += 1
      acc.cost += Number(c.cost_per_click || 0)
      return acc
    }, { clicks: 0, cost: 0 })
    const avgCpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0

    // group by partner/ref (requires join to monetization_configs by monetizable fields)
    const configs = await prisma.monetization_configs.findMany({
      select: { id: true, monetizable_type: true, monetizable_id: true, ref_code: true, partner_id: true, cpc_rate: true }
    })
    const byKey = new Map(configs.map(c => [`${c.monetizable_type}:${c.monetizable_id}`, c]))

    const mapCampaigns: Record<string, { id: string; refCode: string; partnerId: string|null; monetizableType: string; monetizableId: string; cpcRate: number|null; clicks: number; cost: number }> = {}
    for (const c of clicks) {
      const k = `${c.monetizable_type}:${c.monetizable_id}`
      const cfg = byKey.get(k)
      const id = k
      if (!mapCampaigns[id]) {
        mapCampaigns[id] = {
          id,
          refCode: cfg?.ref_code || '—',
          partnerId: cfg?.partner_id || null,
          monetizableType: c.monetizable_type,
          monetizableId: c.monetizable_id,
          cpcRate: cfg?.cpc_rate ?? null,
          clicks: 0,
          cost: 0,
        }
      }
      mapCampaigns[id].clicks += 1
      mapCampaigns[id].cost += Number(c.cost_per_click || 0)
    }

    const campaigns = Object.values(mapCampaigns).sort((a,b)=>b.cost-a.cost).slice(0,50)

    return NextResponse.json({
      range,
      totals: { clicks: totals.clicks, cost: totals.cost, cpc: avgCpc },
      campaigns
    })
  } catch (e) {
    console.error('cpc stats error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


