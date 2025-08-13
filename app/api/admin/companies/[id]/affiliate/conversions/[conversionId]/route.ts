import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string; conversionId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const partnerId = params.id
    const conversionId = params.conversionId
    const body = (await request.json().catch(() => ({}))) as any

    if (!action) return NextResponse.json({ error: 'action required' }, { status: 400 })

    const conv = await prisma.affiliate_conversions.findUnique({ where: { id: conversionId } })
    if (!conv || conv.partner_id !== partnerId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Helpers to merge metadata JSON
    const meta = (() => { try { return conv.metadata ? JSON.parse(conv.metadata) : {} } catch { return {} } })()

    switch (action) {
      case 'approve': {
        meta.status = 'approved'
        await prisma.affiliate_conversions.update({ where: { id: conversionId }, data: { metadata: JSON.stringify(meta), is_billable: true } })
        break
      }
      case 'reverse': {
        meta.status = 'reversed'
        await prisma.affiliate_conversions.update({ where: { id: conversionId }, data: { metadata: JSON.stringify(meta), is_billable: false } })
        break
      }
      case 'bill': {
        const invoice_id = body?.invoice_id as string | undefined
        if (!invoice_id) return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })
        await prisma.affiliate_conversions.update({ where: { id: conversionId }, data: { billed_at: new Date(), invoice_id } })
        break
      }
      case 'unbill': {
        await prisma.affiliate_conversions.update({ where: { id: conversionId }, data: { billed_at: null, invoice_id: null } })
        break
      }
      case 'mark-paid': {
        meta.status = 'paid'
        meta.paid_at = new Date().toISOString()
        await prisma.affiliate_conversions.update({ where: { id: conversionId }, data: { metadata: JSON.stringify(meta) } })
        break
      }
      default:
        return NextResponse.json({ error: 'invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('affiliate conversions action error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


