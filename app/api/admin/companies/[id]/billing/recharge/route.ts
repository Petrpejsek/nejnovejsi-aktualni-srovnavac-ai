import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id
    const body = await request.json()
    const amount = Number(body?.amount)
    const method = String(body?.method || '')
    const description = String(body?.description || 'Admin recharge')
    if (!amount || !method) return NextResponse.json({ error: 'amount and method required' }, { status: 400 })

    await prisma.billingRecord.create({
      data: {
        id: randomUUID(),
        companyId,
        type: 'recharge',
        amount,
        description,
        status: 'completed',
        paymentMethod: method,
        createdAt: new Date(),
        processedAt: new Date(),
      }
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('billing recharge error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


