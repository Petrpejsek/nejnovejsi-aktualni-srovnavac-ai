import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

function parseRange(range: string | null): { gte?: Date } {
  const now = new Date()
  if (!range || range === 'all') return {}
  if (range === '7d') return { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) }
  if (range === '30d') return { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) }
  if (range === '90d') return { gte: new Date(Date.now() - 90 * 24 * 3600 * 1000) }
  return {}
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    const ts = parseRange(range)

    // Collect billable conversions
    const billable = await prisma.affiliate_conversions.findMany({
      where: { partner_id: companyId, is_billable: true, billed_at: null, ...(ts.gte ? { timestamp: { gte: ts.gte } } : {}) },
      select: { id: true, commission_amount: true }
    })
    const amount = billable.reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    if (amount <= 0) return NextResponse.json({ error: 'Nothing to invoice' }, { status: 400 })

    // Generate invoice number (YYYY-SEQ simple)
    const year = new Date().getFullYear()
    const seqBase = await prisma.billingRecord.count({ where: { type: 'invoice', invoiceNumber: { startsWith: String(year) } } })
    const invoiceNumber = `${year}-${String(seqBase + 1).padStart(5, '0')}`

    const invoiceId = randomUUID()
    await prisma.$transaction([
      prisma.billingRecord.create({
        data: {
          id: invoiceId,
          companyId,
          type: 'invoice',
          amount,
          description: `Affiliate commission invoice (${range})`,
          status: 'sent',
          invoiceNumber,
          createdAt: new Date(),
        }
      }),
      prisma.affiliate_conversions.updateMany({ where: { id: { in: billable.map(b => b.id) } }, data: { billed_at: new Date(), invoice_id: invoiceId } })
    ])

    return NextResponse.json({ success: true, invoiceNumber, amount })
  } catch (e) {
    console.error('invoice generate error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


