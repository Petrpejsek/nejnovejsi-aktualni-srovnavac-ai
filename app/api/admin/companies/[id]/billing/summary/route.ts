import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id

    const now = new Date()
    const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000)
    const d90 = new Date(now.getTime() - 90 * 24 * 3600 * 1000)

    // Company balance
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { balance: true } })

    // Payable affiliate (billable conversions not billed)
    const payableAgg = await prisma.affiliate_conversions.aggregate({
      where: { partner_id: companyId, is_billable: true, billed_at: null },
      _sum: { commission_amount: true }
    })

    // Unpaid invoices
    const unpaidAgg = await prisma.billingRecord.aggregate({ where: { companyId, type: 'invoice', status: { not: 'paid' } }, _sum: { amount: true }, _count: { _all: true } as any }) as any

    // Last payment (recharge)
    const lastPayment = await prisma.billingRecord.findFirst({ where: { companyId, type: 'recharge' }, orderBy: { createdAt: 'desc' }, select: { amount: true, createdAt: true } })

    // Total deposited
    const totalDepositedAgg = await prisma.billingRecord.aggregate({ where: { companyId, type: 'recharge' }, _sum: { amount: true } })

    // Total spent last 30d
    const spent30Agg = await prisma.billingRecord.aggregate({ where: { companyId, type: 'spend', createdAt: { gte: d30 } }, _sum: { amount: true } })

    // Cashflow timeline (90d)
    const records = await prisma.billingRecord.findMany({ where: { companyId, createdAt: { gte: d90 } }, select: { createdAt: true, type: true, amount: true, status: true } })
    const byDay: Record<string, { inflow: number; outflow: number }> = {}
    const dateKey = (d: Date) => d.toISOString().slice(0, 10)
    for (const r of records) {
      const k = dateKey(new Date(r.createdAt))
      if (!byDay[k]) byDay[k] = { inflow: 0, outflow: 0 }
      if (r.type === 'recharge' || r.type === 'refund' || (r.type === 'invoice' && r.status === 'paid')) {
        byDay[k].inflow += Number(r.amount || 0)
      } else if (r.type === 'spend' || r.type === 'payout' || r.type === 'invoice') {
        byDay[k].outflow += Number(r.amount || 0)
      }
    }
    const timeline = Object.entries(byDay).map(([date, v]) => ({ date, inflow: v.inflow, outflow: v.outflow }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      balance: Number(company?.balance || 0),
      payableAffiliate: Number(payableAgg._sum.commission_amount || 0),
      unpaidInvoices: { amount: Number(unpaidAgg._sum?.amount || 0), count: Number(unpaidAgg._count?._all || 0) },
      lastPayment,
      totalDeposited: Number(totalDepositedAgg._sum.amount || 0),
      totalSpent30d: Number(spent30Agg._sum.amount || 0),
      timeline,
      recent: await prisma.billingRecord.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, type: true, amount: true, description: true, status: true, createdAt: true } })
    })
  } catch (e) {
    console.error('billing summary error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


