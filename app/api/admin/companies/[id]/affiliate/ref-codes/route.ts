import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const items = await prisma.monetization_configs.findMany({
      where: { partner_id: partnerId, mode: 'affiliate' },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        ref_code: true,
        monetizable_type: true,
        monetizable_id: true,
        affiliate_link: true,
        is_active: true,
        affiliate_rate: true,
        total_affiliate_clicks: true,
        total_conversions: true,
        total_revenue: true,
        created_at: true,
        updated_at: true,
      }
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('ref-codes GET error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const partnerId = params.id
    const body = await request.json()
    const { ref_code, monetizable_type, monetizable_id, affiliate_rate, affiliate_link, is_active } = body || {}
    if (!ref_code || !monetizable_type || !monetizable_id) {
      return NextResponse.json({ error: 'ref_code, monetizable_type, monetizable_id required' }, { status: 400 })
    }
    const created = await prisma.monetization_configs.create({
      data: {
        id: randomUUID(),
        ref_code,
        partner_id: partnerId,
        mode: 'affiliate',
        monetizable_type,
        monetizable_id,
        affiliate_rate: affiliate_rate != null ? Number(affiliate_rate) : null,
        affiliate_link: affiliate_link || null,
        is_active: is_active ?? true,
        updated_at: new Date(),
      }
    })
    return NextResponse.json({ success: true, item: created })
  } catch (e) {
    console.error('ref-codes POST error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id, is_active, affiliate_rate, affiliate_link } = body || {}
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const updated = await prisma.monetization_configs.update({
      where: { id },
      data: {
        is_active: typeof is_active === 'boolean' ? is_active : undefined,
        affiliate_rate: affiliate_rate != null ? Number(affiliate_rate) : undefined,
        affiliate_link: affiliate_link != null ? String(affiliate_link) : undefined,
      }
    })
    return NextResponse.json({ success: true, item: updated })
  } catch (e) {
    console.error('ref-codes PUT error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('id')
    if (!configId) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.monetization_configs.delete({ where: { id: configId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('ref-codes DELETE error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


