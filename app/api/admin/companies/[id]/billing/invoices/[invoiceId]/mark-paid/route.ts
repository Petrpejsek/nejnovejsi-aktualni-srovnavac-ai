import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string, invoiceId: string } }) {
  try {
    const { id: companyId, invoiceId } = params
    const body = await request.json().catch(() => ({}))
    const amount = body?.amount as number | undefined
    const method = body?.method as string | undefined
    if (amount == null || !method) return NextResponse.json({ error: 'amount and method required' }, { status: 400 })
    const inv = await prisma.billingRecord.findUnique({ where: { id: invoiceId } })
    if (!inv || inv.companyId !== companyId || inv.type !== 'invoice') return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.billingRecord.update({ where: { id: invoiceId }, data: { status: 'paid', paymentMethod: method, processedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('invoice mark-paid error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


