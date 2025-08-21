import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

type Ga4Row = Record<string, any>

async function ga4Report(body: any) {
  const propertyId = process.env.GA4_PROPERTY_ID
  const token = process.env.GA4_SERVICE_TOKEN
  if (!propertyId || !token) throw new Error('GA4 credentials missing')

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) throw new Error(`GA4 API error ${res.status}`)
  return res.json()
}

function toMinor(amount: number | null): bigint {
  if (!amount) return BigInt(0)
  return BigInt(Math.round(amount * 100))
}

function rowsToObjs(resp: any) {
  const out: any[] = []
  const dims = resp.dimensionHeaders.map((d: any) => d.name)
  const mets = resp.metricHeaders.map((m: any) => m.name)
  for (const r of resp.rows || []) {
    const o: any = {}
    dims.forEach((d: string, i: number) => (o[d] = r.dimensionValues[i]?.value || ''))
    mets.forEach((m: string, i: number) => (o[m] = Number(r.metricValues[i]?.value || '0')))
    out.push(o)
  }
  return out
}

function mapKey(r: any) {
  return [
    r.dateHourMinute,
    r.sessionDefaultChannelGroup || '(other)',
    r.source || '(not set)',
    r.medium || '(not set)',
    r.campaign || '(not set)',
    (r.landingPagePlusQueryString || '/').split('?')[0],
    r.deviceCategory || '(not set)',
  ].join('\u0001')
}

function parseYmd(ymd: string): Date {
  // ymd is YYYYMMDDHHmm for dateHourMinute; we only set day portion
  const y = ymd.slice(0, 4)
  const m = ymd.slice(4, 6)
  const d = ymd.slice(6, 8)
  return new Date(`${y}-${m}-${d}T00:00:00Z`)
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_NEXT_API_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({})) as { days?: number }
    const days = Math.max(1, Math.min(30, body.days || 7))

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    let totalRows = 0

    for (let i = 0; i < days; i++) {
      const d = new Date(today)
      d.setUTCDate(today.getUTCDate() - i)
      const dateStr = d.toISOString().slice(0, 10)

      const overview = await ga4Report({
        dateRanges: [{ startDate: dateStr, endDate: dateStr }],
        dimensions: [
          { name: 'dateHourMinute' },
          { name: 'sessionDefaultChannelGroup' },
          { name: 'source' },
          { name: 'medium' },
          { name: 'campaign' },
          { name: 'landingPagePlusQueryString' },
          { name: 'deviceCategory' },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
        ],
        limit: 100000,
      })

      const events = await ga4Report({
        dateRanges: [{ startDate: dateStr, endDate: dateStr }],
        dimensions: [
          { name: 'dateHourMinute' },
          { name: 'sessionDefaultChannelGroup' },
          { name: 'source' },
          { name: 'medium' },
          { name: 'campaign' },
          { name: 'landingPagePlusQueryString' },
          { name: 'deviceCategory' },
          { name: 'eventName' },
        ],
        metrics: [{ name: 'eventCount' }],
        limit: 100000,
      })

      let costs: any = null
      try {
        costs = await ga4Report({
          dateRanges: [{ startDate: dateStr, endDate: dateStr }],
          dimensions: [
            { name: 'dateHourMinute' },
            { name: 'sessionDefaultChannelGroup' },
            { name: 'source' },
            { name: 'medium' },
            { name: 'campaign' },
            { name: 'landingPagePlusQueryString' },
            { name: 'deviceCategory' },
          ],
          metrics: [{ name: 'adCost' }],
          limit: 100000,
        })
      } catch {}

      const oRows = rowsToObjs(overview)
      const eRows = rowsToObjs(events)
      const cRows = costs ? rowsToObjs(costs) : []

      const acc = new Map<string, any>()
      for (const r of oRows) {
        const key = mapKey(r)
        acc.set(key, {
          date_time: new Date(
            `${r.dateHourMinute.slice(0, 4)}-${r.dateHourMinute.slice(4, 6)}-${r.dateHourMinute.slice(6, 8)}T${r.dateHourMinute.slice(8, 10)}:${r.dateHourMinute.slice(10, 12)}:00Z`
          ),
          channel_group: r.sessionDefaultChannelGroup || '(other)',
          source: r.source || '(not set)',
          medium: r.medium || '(not set)',
          campaign: r.campaign || '(not set)',
          landing_path: (r.landingPagePlusQueryString || '/').split('?')[0],
          device: r.deviceCategory || '(not set)',
          users: r.activeUsers || 0,
          sessions: r.sessions || 0,
          engaged_sessions: r.engagedSessions || 0,
          engagement_rate: r.engagementRate || 0,
          pageviews: r.screenPageViews || 0,
          conversions_total: r.conversions || 0,
          click_outs: 0,
          sign_ups: 0,
          activations: 0,
          affiliate_conversions: 0,
          revenue_minor: BigInt(0),
          ad_cost_minor: BigInt(0),
          cpc_minor: BigInt(0),
        })
      }

      for (const r of eRows) {
        const key = mapKey(r)
        const item = acc.get(key)
        if (!item) continue
        if (r.eventName === 'affiliate_click_out') item.click_outs += r.eventCount || 0
        if (r.eventName === 'sign_up') item.sign_ups += r.eventCount || 0
        if (r.eventName === 'activation') item.activations += r.eventCount || 0
        if (r.eventName === 'affiliate_conversion') item.affiliate_conversions += r.eventCount || 0
      }

      for (const r of cRows) {
        const key = mapKey(r)
        const item = acc.get(key)
        if (!item) continue
        item.ad_cost_minor = toMinor(r.adCost || 0)
      }

      for (const value of acc.values()) {
        await prisma.ga4Timeseries.upsert({
          where: {
            date_time_channel_group_source_medium_campaign_landing_path_device: {
              date_time: value.date_time,
              channel_group: value.channel_group,
              source: value.source,
              medium: value.medium,
              campaign: value.campaign,
              landing_path: value.landing_path,
              device: value.device,
            },
          },
          update: value,
          create: value,
        })
        totalRows++
      }
    }

    return NextResponse.json({ ok: true, rows: totalRows })
  } catch (e: any) {
    console.error('ga4 recalc error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}


