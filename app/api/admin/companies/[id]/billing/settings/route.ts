import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const acc = await prisma.billing_accounts.findUnique({ where: { partner_id: partnerId } })
    return NextResponse.json({ settings: acc || null })
  } catch (e) {
    console.error('billing settings GET error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const body = await request.json()
    const data: any = {}
    const allowed = [
      'auto_recharge_enabled','auto_recharge_threshold','auto_recharge_amount','daily_spend_limit','monthly_spend_limit','affiliate_billing_threshold'
    ]
    for (const k of allowed) if (k in body) data[k] = typeof body[k] === 'number' ? Number(body[k]) : body[k]
    data.updated_at = new Date()
    const saved = await prisma.billing_accounts.upsert({
      where: { partner_id: partnerId },
      update: data,
      create: { id: randomUUID(), partner_id: partnerId, ...data }
    })
    return NextResponse.json({ success: true, settings: saved })
  } catch (e) {
    console.error('billing settings PUT error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


