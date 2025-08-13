import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseStripeCreated(range: string | null): { gte?: number } {
  const now = Math.floor(Date.now() / 1000)
  if (!range || range === 'all') return {}
  if (range === '7d') return { gte: now - 7 * 24 * 3600 }
  if (range === '30d') return { gte: now - 30 * 24 * 3600 }
  if (range === '90d') return { gte: now - 90 * 24 * 3600 }
  if (range === 'today') {
    const d = new Date(); d.setHours(0,0,0,0)
    return { gte: Math.floor(d.getTime()/1000) }
  }
  return {}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = params.id
    const range = searchParams.get('range') || '30d'
    const status = searchParams.get('status') || undefined
    const pageSize = Math.min(100, parseInt(searchParams.get('limit') || '50'))
    const forCsv = searchParams.get('format') === 'csv'

    const acc = await prisma.billing_accounts.findUnique({ where: { partner_id: companyId }, select: { stripe_customer_id: true } })
    const customerId = acc?.stripe_customer_id
    if (!customerId) return NextResponse.json({ error: 'Stripe not configured for this company' }, { status: 400 })

    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not set' }, { status: 500 })

    // Dynamický import Stripe SDK (vyhne se build-time lint rule)
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(key, { apiVersion: '2023-10-16' } as any)

    const created = parseStripeCreated(range)
    const list = await stripe.invoices.list({ customer: customerId, limit: pageSize, status: status as any, created: Object.keys(created).length ? created : undefined })

    const items = (list.data || []).map((inv: any) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      currency: inv.currency?.toUpperCase?.() || 'USD',
      amount_due: (inv.amount_due || 0) / 100,
      amount_paid: (inv.amount_paid || 0) / 100,
      amount_remaining: (inv.amount_remaining || 0) / 100,
      created: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
      paid: !!inv.paid,
      hosted_invoice_url: inv.hosted_invoice_url || null,
      invoice_pdf: inv.invoice_pdf || null,
    }))

    if (forCsv) {
      const header = ['id','number','status','currency','amount_due','amount_paid','amount_remaining','created','due_date','paid','hosted_invoice_url'].join(',')
      const lines = items.map((i: any) => [i.id,i.number,i.status,i.currency,i.amount_due,i.amount_paid,i.amount_remaining,i.created||'',i.due_date||'',String(i.paid),i.hosted_invoice_url||''].join(','))
      return new NextResponse([header, ...lines].join('\n'), { headers: { 'Content-Type': 'text/csv' } })
    }

    return NextResponse.json({ items })
  } catch (e) {
    console.error('stripe invoices list error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


