import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// Force edge disabled to access Node crypto reliably
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ParsedGaCookies = {
  clientId: string | null
}

function parseGaClientId(request: NextRequest): ParsedGaCookies {
  // Try GA4 cookie formats: _ga, _ga_<MEASUREMENT_ID>
  const allCookies = request.cookies.getAll()
  let clientId: string | null = null
  for (const c of allCookies) {
    if (c.name === '_ga' || c.name.startsWith('_ga_')) {
      // GA cookie format typically GA1.2.XXXXXXXXXX.YYYYYYYYYY or clientId directly
      const value = c.value
      const parts = value.split('.')
      if (parts.length >= 4 && parts[0].startsWith('GA')) {
        clientId = `${parts[2]}.${parts[3]}`
        break
      }
      if (!clientId && value && value.length > 0) {
        clientId = value
      }
    }
  }
  return { clientId }
}

function hashIp(ip: string | null, salt: string | undefined): string | null {
  if (!ip || !salt) return null
  const h = crypto.createHmac('sha256', salt)
  h.update(ip)
  return h.digest('hex')
}

function extractHostname(url: string): string | null {
  try {
    const u = new URL(url)
    return u.hostname.toLowerCase()
  } catch {
    return null
  }
}

function isHostAllowed(destinationHost: string, allowedHost: string): boolean {
  // Allow exact or subdomain match of allowedHost
  const host = destinationHost.toLowerCase()
  const allow = allowedHost.toLowerCase()
  return host === allow || host.endsWith('.' + allow)
}

async function sendGa4Mp(params: {
  clientId: string | null
  userId?: string | null
  eventId: string
  sessionId?: string | null
  sessionNumber?: number | null
  measurementId: string
  apiSecret: string
  partnerId: string
  offerId: string
  clickId: string
  destinationDomain: string
  cpcValueMinor: bigint
  currency: string
  timestampMicros?: number
}) {
  const {
    clientId,
    userId,
    eventId,
    sessionId,
    sessionNumber,
    measurementId,
    apiSecret,
    partnerId,
    offerId,
    clickId,
    destinationDomain,
    cpcValueMinor,
    currency,
  } = params

  // GA4 expects value in major units
  const value = Number(cpcValueMinor) / 100

  if (!clientId) {
    // Strict: do not send without client_id (no fallbacks)
    return
  }

  const body: any = {
    client_id: clientId,
    non_personalized_ads: false,
    events: [
      {
        name: 'affiliate_click_out',
        params: {
          event_id: eventId,
          partner_id: partnerId,
          offer_id: offerId,
          click_id: clickId,
          destination_domain: destinationDomain,
          value,
          currency,
          engagement_time_msec: 1,
        },
      },
    ],
  }

  if (userId) body.user_id = userId
  if (sessionId) body.events[0].params.session_id = sessionId
  if (sessionNumber != null) body.events[0].params.session_number = sessionNumber
  if (params.timestampMicros) (body as any).timestamp_micros = params.timestampMicros

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('GA4 MP send error', e)
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const destination = url.searchParams.get('u')
  const partnerId = url.searchParams.get('partner_id')
  const offerId = url.searchParams.get('offer_id')
  const eventId = url.searchParams.get('ev') || ''
  const sessionId = url.searchParams.get('ga_session_id')
  const sessionNumberParam = url.searchParams.get('ga_session_number')
  const sessionNumber = sessionNumberParam ? Number(sessionNumberParam) : null

  // UTM and ads params
  const utm_source = url.searchParams.get('utm_source')
  const utm_medium = url.searchParams.get('utm_medium')
  const utm_campaign = url.searchParams.get('utm_campaign')
  const gclid = url.searchParams.get('gclid')
  const dclid = url.searchParams.get('dclid')
  const wbraid = url.searchParams.get('wbraid')
  const gbraid = url.searchParams.get('gbraid')

  const headers = new Headers()
  headers.set('Cache-Control', 'no-store')
  headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  headers.set('X-Robots-Tag', 'noindex, nofollow')

  try {
    if (!destination || !partnerId || !offerId) {
      return new NextResponse('Missing required parameters', { status: 400, headers })
    }
    const destHost = extractHostname(destination)
    if (!destHost) {
      return new NextResponse('Invalid destination URL', { status: 400, headers })
    }

    // Load offer to get CPC, currency and allowed domain
    const offer = await prisma.offer.findUnique({ where: { id: offerId } })
    if (!offer || offer.partner_id !== partnerId) {
      return new NextResponse('Unknown offer/partner', { status: 400, headers })
    }
    if (!offer.target_domain) {
      return new NextResponse('Offer missing target domain', { status: 400, headers })
    }
    if (!isHostAllowed(destHost, offer.target_domain)) {
      return new NextResponse('Destination not allowed', { status: 400, headers })
    }

    const { clientId } = parseGaClientId(request)
    const referrer = request.headers.get('referer') || null
    const userAgent = request.headers.get('user-agent') || null
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || null
    const ipHash = hashIp(ip, process.env.ANONYMIZATION_SALT)

    // Require event id to align with frontend event to dedupe
    const clickId = crypto.randomUUID()
    const usedEventId = eventId || clickId

    // Insert log
    await prisma.clicksCpc.create({
      data: {
        click_id: clickId,
        partner_id: partnerId,
        offer_id: offerId,
        client_id: clientId,
        ga_session_id: sessionId || null,
        ga_session_number: sessionNumber,
        destination_domain: destHost,
        utm_source,
        utm_medium,
        utm_campaign,
        gclid,
        dclid,
        wbraid,
        gbraid,
        referer: referrer,
        ip_hash: ipHash,
        ua: userAgent,
        cpc_value_minor: offer.cpc_value_minor as unknown as bigint,
        currency: offer.currency,
      },
    })

    // Fire server-side GA4 MP (consent-aware)
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
    const apiSecret = process.env.GA4_API_SECRET || ''

    // Consent Mode v2: accept analytics_storage from query string (sent by FE/GTM)
    const analyticsStorage = url.searchParams.get('analytics_storage') // 'granted' | 'denied'
    const consentGranted = analyticsStorage === 'granted'

    if (measurementId && apiSecret && consentGranted) {
      await sendGa4Mp({
        clientId,
        eventId: usedEventId,
        sessionId,
        sessionNumber,
        measurementId,
        apiSecret,
        partnerId,
        offerId,
        clickId,
        destinationDomain: destHost,
        cpcValueMinor: offer.cpc_value_minor as unknown as bigint,
        currency: offer.currency,
      })
    }

    return NextResponse.redirect(destination, { status: 307, headers })
  } catch (error) {
    console.error('Redirector error', error)
    return new NextResponse('Internal Server Error', { status: 500, headers })
  }
}


