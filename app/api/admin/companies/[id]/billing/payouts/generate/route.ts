import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id
    const thresholdAcc = await prisma.billing_accounts.findUnique({ where: { partner_id: companyId } })
    const threshold = Number(thresholdAcc?.affiliate_billing_threshold || 0)
    const payableAgg = await prisma.affiliate_conversions.aggregate({ where: { partner_id: companyId, is_billable: true, billed_at: null }, _sum: { commission_amount: true } })
    const amount = Number(payableAgg._sum.commission_amount || 0)
    if (amount <= 0 || amount < threshold) return NextResponse.json({ error: 'Below threshold' }, { status: 400 })

    const payoutId = randomUUID()
    await prisma.billingRecord.create({
      data: {
        id: payoutId,
        companyId,
        type: 'payout',
        amount,
        description: 'Affiliate payout (generated)',
        status: 'pending'
      }
    })
    return NextResponse.json({ success: true, amount })
  } catch (e) {
    console.error('payout generate error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


