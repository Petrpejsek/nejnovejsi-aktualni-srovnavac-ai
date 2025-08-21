import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_NEXT_API_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      partner_id,
      offer_id,
      click_id,
      network_txn_id,
      status,
      payout_value_minor,
      currency,
      raw,
    } = body

    await prisma.affiliatePostback.upsert({
      where: { partner_id_network_txn_id: { partner_id, network_txn_id } },
      update: {
        status,
        payout_value_minor: BigInt(payout_value_minor),
        currency,
        raw_payload: raw ?? body,
        approved_at: status === 'approved' ? new Date() : null,
      },
      create: {
        partner_id,
        offer_id,
        click_id,
        network_txn_id,
        status,
        payout_value_minor: BigInt(payout_value_minor),
        currency,
        raw_payload: raw ?? body,
        approved_at: status === 'approved' ? new Date() : null,
      },
    })

    // Lookup GA context from click
    const click = await prisma.clicksCpc.findUnique({ where: { click_id } })
    const clientId = click?.client_id || null
    const gaSessionId = click?.ga_session_id || null
    const gaSessionNumber = click?.ga_session_number || null

    // Send GA4 MP affiliate_conversion
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
    const apiSecret = process.env.GA4_API_SECRET || ''
    // Send only if we have a valid GA client_id (no fallbacks)
    if (measurementId && apiSecret && clientId) {
      const eventId = `${click_id}:${network_txn_id}`
      const value = Number(payout_value_minor || 0) / 100
      const payload: any = {
        client_id: clientId,
        events: [
          {
            name: 'affiliate_conversion',
            params: {
              event_id: eventId,
              partner_id,
              offer_id,
              click_id,
              status,
              value,
              currency,
              engagement_time_msec: 1,
            },
          },
        ],
      }
      if (gaSessionId) payload.events[0].params.session_id = gaSessionId
      if (gaSessionNumber != null) payload.events[0].params.session_number = gaSessionNumber

      const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
        measurementId
      )}&api_secret=${encodeURIComponent(apiSecret)}`
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('affiliate postback-store error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}


