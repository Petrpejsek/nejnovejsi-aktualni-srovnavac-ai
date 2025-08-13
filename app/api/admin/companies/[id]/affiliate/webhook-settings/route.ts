import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Webhook settings jsou uchovány v tabulce billing_accounts.metadata (JSON) – zde jednoduchý JSON read/write

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const acct = await prisma.billing_accounts.findUnique({ where: { partner_id: partnerId }, select: { metadata: true } })
    let settings: any = {}
    try { settings = acct?.metadata ? JSON.parse(acct.metadata) : {} } catch { settings = {} }
    return NextResponse.json({ settings: settings?.affiliateWebhook || {} })
  } catch (e) {
    console.error('webhook-settings GET error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const body = await request.json()
    const { endpoint, secret, enabled, retry, signature, secretId } = body || {}

    const acct = await prisma.billing_accounts.findUnique({ where: { partner_id: partnerId } })
    let metadata: any = {}
    try { metadata = acct?.metadata ? JSON.parse(acct.metadata) : {} } catch { metadata = {} }
    metadata.affiliateWebhook = {
      ...(metadata.affiliateWebhook || {}),
      endpoint: endpoint ?? metadata?.affiliateWebhook?.endpoint ?? null,
      secret: secret ?? metadata?.affiliateWebhook?.secret ?? null,
      secretId: secretId ?? metadata?.affiliateWebhook?.secretId ?? null,
      enabled: typeof enabled === 'boolean' ? enabled : (metadata?.affiliateWebhook?.enabled ?? true),
      retry: retry ?? metadata?.affiliateWebhook?.retry ?? { max: 5, backoffMs: 2000 },
      signature: signature ?? metadata?.affiliateWebhook?.signature ?? 'hmac-sha256',
      updatedAt: new Date().toISOString(),
    }

    const saved = await prisma.billing_accounts.upsert({
      where: { partner_id: partnerId },
      update: { metadata: JSON.stringify(metadata), updated_at: new Date() },
      create: { id: crypto.randomUUID(), partner_id: partnerId, metadata: JSON.stringify(metadata), updated_at: new Date() }
    })
    return NextResponse.json({ success: true, settings: metadata.affiliateWebhook })
  } catch (e) {
    console.error('webhook-settings PUT error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


