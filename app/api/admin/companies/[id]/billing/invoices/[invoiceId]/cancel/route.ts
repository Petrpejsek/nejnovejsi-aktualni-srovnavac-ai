import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string, invoiceId: string } }) {
  try {
    const { id: companyId, invoiceId } = params
    const inv = await prisma.billingRecord.findUnique({ where: { id: invoiceId } })
    if (!inv || inv.companyId !== companyId || inv.type !== 'invoice') return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.billingRecord.update({ where: { id: invoiceId }, data: { status: 'cancelled', processedAt: new Date() } })
    // Optional: odpojit konverze z faktury
    await prisma.affiliate_conversions.updateMany({ where: { invoice_id: invoiceId }, data: { billed_at: null, invoice_id: null } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('invoice cancel error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


