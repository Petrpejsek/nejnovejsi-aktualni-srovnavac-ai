import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseRange(range: string | null): { gte?: Date } {
  const now = new Date()
  if (!range || range === 'all') return {}
  if (range === 'today') return { gte: new Date(now.setHours(0, 0, 0, 0)) }
  if (range === 'yesterday') {
    const start = new Date(now)
    start.setDate(start.getDate() - 1)
    start.setHours(0, 0, 0, 0)
    return { gte: start }
  }
  if (range === '7d') return { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  if (range === '30d') return { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  if (range === '90d') return { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  return {}
}

function parseStatus(metadataStr?: string | null): string | null {
  if (!metadataStr) return null
  try {
    const meta = JSON.parse(metadataStr)
    return typeof meta?.status === 'string' ? meta.status : null
  } catch {
    return null
  }
}

function parsePaidAt(metadataStr?: string | null): string | null {
  if (!metadataStr) return null
  try {
    const meta = JSON.parse(metadataStr)
    return meta?.paid_at || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const createdAt = parseRange(range)
    const partnerId = params.id

    // clicks
    const clicks = await prisma.affiliate_clicks.findMany({
      where: {
        partner_id: partnerId,
        ...(createdAt.gte ? { timestamp: createdAt as any } : {}),
      },
      select: {
        id: true,
        ref_code: true,
        country: true,
        user_agent: true,
        is_valid: true,
        timestamp: true,
        monetizable_type: true,
        monetizable_id: true,
      }
    })

    const totalClicks = clicks.length
    const validClicks = clicks.filter(c => c.is_valid).length
    const invalidClicks = totalClicks - validClicks

    // conversions
    const conversions = await prisma.affiliate_conversions.findMany({
      where: {
        partner_id: partnerId,
        ...(createdAt.gte ? { timestamp: createdAt as any } : {}),
      },
      select: {
        id: true,
        ref_code: true,
        conversion_value: true,
        commission_amount: true,
        commission_rate: true,
        timestamp: true,
        is_billable: true,
        billed_at: true,
        invoice_id: true,
        metadata: true,
        monetizable_type: true,
        monetizable_id: true,
      }
    })

    const totalConversions = conversions.length
    const statusCounts = conversions.reduce((acc: any, conv) => {
      const s = parseStatus(conv.metadata) || 'unknown'
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {})

    const commission = conversions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0)
    const revenue = conversions.reduce((sum, c) => sum + Number(c.conversion_value || 0), 0)
    const cr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    const epc = totalClicks > 0 ? commission / totalClicks : 0
    const aov = totalConversions > 0 ? revenue / totalConversions : 0

    // spend for ROI (partner-level CPC spend)
    const spendAgg = await prisma.ad_clicks_monetization.aggregate({
      where: {
        partner_id: partnerId,
        ...(createdAt.gte ? { timestamp: createdAt as any } : {}),
        is_valid_click: true,
      },
      _sum: { cost_per_click: true }
    })
    const spend = Number(spendAgg._sum.cost_per_click || 0)
    const roi = spend > 0 ? (commission / spend) * 100 : null

    // timeline by day (clicks, conversions, commission)
    const dayKey = (d: Date) => d.toISOString().slice(0, 10)
    const dayMap: Record<string, { clicks: number; conversions: number; commission: number }> = {}
    for (const c of clicks) {
      const k = dayKey(new Date(c.timestamp))
      if (!dayMap[k]) dayMap[k] = { clicks: 0, conversions: 0, commission: 0 }
      dayMap[k].clicks++
    }
    for (const conv of conversions) {
      const k = dayKey(new Date(conv.timestamp))
      if (!dayMap[k]) dayMap[k] = { clicks: 0, conversions: 0, commission: 0 }
      dayMap[k].conversions++
      dayMap[k].commission += Number(conv.commission_amount || 0)
    }
    const timeline = Object.entries(dayMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // geo
    const geoMap: Record<string, { clicks: number; conversions: number; commission: number }> = {}
    for (const c of clicks) {
      const g = c.country || 'Unknown'
      if (!geoMap[g]) geoMap[g] = { clicks: 0, conversions: 0, commission: 0 }
      geoMap[g].clicks++
    }
    for (const conv of conversions) {
      const g = 'Unknown'
      // country for conversion may not be present, skip
      if (!geoMap[g]) geoMap[g] = { clicks: 0, conversions: 0, commission: 0 }
      geoMap[g].conversions++
      geoMap[g].commission += Number(conv.commission_amount || 0)
    }
    const geo = Object.entries(geoMap)
      .map(([country, v]) => ({ country, ...v }))

    // devices from user_agent heuristic
    let desktop = 0, mobile = 0, tablet = 0
    for (const c of clicks) {
      const ua = (c.user_agent || '').toLowerCase()
      if (/ipad|tablet/.test(ua)) tablet++
      else if (/mobi|android|iphone/.test(ua)) mobile++
      else desktop++
    }
    const totalUA = desktop + mobile + tablet || 1
    const devices = {
      desktop: Math.round((desktop / totalUA) * 100),
      mobile: Math.round((mobile / totalUA) * 100),
      tablet: Math.round((tablet / totalUA) * 100),
    }

    // top pages (by monetizable id)
    const pageAgg: Record<string, { clicks: number; conversions: number; commission: number }> = {}
    for (const c of clicks) {
      const k = `${c.monetizable_type}:${c.monetizable_id}`
      if (!pageAgg[k]) pageAgg[k] = { clicks: 0, conversions: 0, commission: 0 }
      pageAgg[k].clicks++
    }
    for (const conv of conversions) {
      const k = `${conv.monetizable_type}:${conv.monetizable_id}`
      if (!pageAgg[k]) pageAgg[k] = { clicks: 0, conversions: 0, commission: 0 }
      pageAgg[k].conversions++
      pageAgg[k].commission += Number(conv.commission_amount || 0)
    }
    const topPages = Object.entries(pageAgg)
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20)

    // quality flags
    const invalidRatio = totalClicks > 0 ? (invalidClicks / totalClicks) * 100 : 0
    const flags: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string }> = []
    if (invalidRatio > 15) flags.push({ type: 'invalid_clicks', severity: 'medium', message: `Invalid clicks ratio ${invalidRatio.toFixed(1)}%` })
    if ((statusCounts['reversed'] || 0) / Math.max(1, totalConversions) > 0.1) flags.push({ type: 'reversal_rate', severity: 'medium', message: 'High reversal rate' })

    // billing snapshot
    const billed = conversions.filter(c => c.billed_at != null).reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    const paid = conversions.filter(c => !!parsePaidAt(c.metadata)).reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    const payable = conversions.filter(c => c.is_billable && !c.billed_at).reduce((s, c) => s + Number(c.commission_amount || 0), 0)

    return NextResponse.json({
      range,
      kpis: {
        clicks: totalClicks,
        validClicks,
        invalidRatio,
        conversions: totalConversions,
        statusCounts,
        commission,
        revenue,
        cr,
        epc,
        aov,
        roi,
      },
      timeline,
      geo,
      devices,
      topPages,
      quality: { invalidRatio },
      flags,
      billing: { billed, paid, payable, spend },
    })
  } catch (e) {
    console.error('affiliate detailed error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


