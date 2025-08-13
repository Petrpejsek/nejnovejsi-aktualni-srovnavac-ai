import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const acct = await prisma.billing_accounts.findUnique({ where: { partner_id: partnerId }, select: { metadata: true } })
    let settings: any = {}
    try { settings = acct?.metadata ? JSON.parse(acct.metadata) : {} } catch { settings = {} }
    return NextResponse.json({ linkSettings: settings?.linkSettings || {} })
  } catch (e) {
    console.error('link-settings GET error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const body = await request.json()
    const linkSettings = body?.linkSettings
    if (!linkSettings || typeof linkSettings !== 'object') {
      return NextResponse.json({ error: 'linkSettings object is required' }, { status: 400 })
    }

    const acct = await prisma.billing_accounts.findUnique({ where: { partner_id: partnerId } })
    let metadata: any = {}
    try { metadata = acct?.metadata ? JSON.parse(acct.metadata) : {} } catch { metadata = {} }
    metadata.linkSettings = linkSettings

    await prisma.billing_accounts.upsert({
      where: { partner_id: partnerId },
      update: { metadata: JSON.stringify(metadata), updated_at: new Date() },
      create: { id: randomUUID(), partner_id: partnerId, metadata: JSON.stringify(metadata), updated_at: new Date() }
    })

    // audit to WebhookLog for traceability
    try {
      await prisma.webhookLog.create({
        data: {
          requestId: randomUUID(),
          method: 'PUT',
          endpoint: '/affiliate/link-settings',
          statusCode: 200,
          details: { partnerId, linkSettings },
          secretId: undefined,
        } as any
      } as any)
    } catch {}

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('link-settings PUT error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


