import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function buildUrl(template: string, vars: Record<string, string>) {
  // Support both {var} and ${var} placeholders
  let out = template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
  out = out.replace(/\$\{(\w+)\}/g, (_m, k) => vars[k] ?? '')
  return out
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const partnerId = params.id
    const entityType = searchParams.get('entityType') as 'landing' | 'product' | null
    const entityId = searchParams.get('entityId')
    const ref_code = searchParams.get('ref_code')
    const domain = searchParams.get('domain') // explicit domain required – žádné defaulty
    const sub1 = searchParams.get('sub1') || undefined
    const sub2 = searchParams.get('sub2') || undefined

    if (!entityType || !entityId || !ref_code || !domain) {
      return NextResponse.json({ error: 'entityType, entityId, ref_code, domain are required' }, { status: 400 })
    }

    // Load link settings
    const acct = await prisma.billing_accounts.findUnique({ where: { partner_id: partnerId }, select: { metadata: true } })
    if (!acct?.metadata) return NextResponse.json({ error: 'linkSettings not configured' }, { status: 400 })
    let meta: any = {}
    try { meta = JSON.parse(acct.metadata) } catch { return NextResponse.json({ error: 'invalid metadata json' }, { status: 400 }) }
    const linkSettings = meta.linkSettings
    if (!linkSettings) return NextResponse.json({ error: 'linkSettings missing' }, { status: 400 })

    // param keys
    const paramKeys = linkSettings.paramKeys
    if (!paramKeys?.ref) return NextResponse.json({ error: 'paramKeys.ref not configured' }, { status: 400 })

    // allowlist validation
    const allow = Array.isArray(linkSettings.allowlistDomains) ? linkSettings.allowlistDomains : []
    const isAllowed = allow.includes(domain)
    if (!isAllowed) return NextResponse.json({ error: 'domain not allowed' }, { status: 400 })

    // template
    const template = linkSettings.templates?.default as string | undefined
    if (!template || !template.includes('{domain}')) return NextResponse.json({ error: 'templates.default must include {domain}' }, { status: 400 })

    // compute UTM from defaults
    const utm = linkSettings.utmDefaults || {}

    // build query params
    const paramsList: Array<[string, string]> = []
    paramsList.push([paramKeys.ref, ref_code])
    if (utm.source) paramsList.push(['utm_source', String(utm.source)])
    if (utm.medium) paramsList.push(['utm_medium', String(utm.medium)])
    if (utm.campaign) paramsList.push(['utm_campaign', String(utm.campaign).replace('${companyId}', partnerId)])
    if (utm.content) paramsList.push(['utm_content', String(utm.content).replace('${ref_code}', ref_code)])
    if (utm.term) paramsList.push(['utm_term', String(utm.term).replace('${landingSlug}', entityId)])
    if (paramKeys.sub1 && sub1) paramsList.push([paramKeys.sub1, sub1])
    if (paramKeys.sub2 && sub2) paramsList.push([paramKeys.sub2, sub2])

    const query = paramsList.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')

    if (entityType === 'landing') {
      // we accept entityId as slug
    } else if (entityType === 'product') {
      // accept product id as path segment
    } else {
      return NextResponse.json({ error: 'unsupported entityType' }, { status: 400 })
    }

    const vars = {
      domain,
      landingSlug: entityType === 'landing' ? entityId : '',
      productId: entityType === 'product' ? entityId : '',
      params: query,
    }
    let url = buildUrl(template, vars)
    // If template not using productId/landingSlug properly, enforce default path
    if (!url.includes('?')) url += `?${query}`
    // If template didn't include slug/id at all, add sensible default path for landing/products
    if (entityType === 'landing' && !/\/landing\//.test(url)) url = `https://${domain}/landing/${entityId}?${query}`
    if (entityType === 'product' && !/\/product\//.test(url)) url = `https://${domain}/product/${entityId}?${query}`

    // Optional HEAD test (internal only)
    let headStatus: number | null = null
    try {
      const res = await fetch(url, { method: 'HEAD' as any, redirect: 'manual' as any, cache: 'no-store' as any })
      headStatus = res.status
    } catch {
      headStatus = null
    }

    return NextResponse.json({ url, headStatus })
  } catch (e) {
    console.error('link-builder GET error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


