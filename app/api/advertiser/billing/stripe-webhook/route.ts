import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/advertiser/billing/stripe-webhook - Stripe webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    // V produkci byste měli ověřit signature pomocí Stripe
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    
    // Pro vývoj přijmeme event přímo
    const event = JSON.parse(body)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      
      console.log('💰 Payment succeeded:', paymentIntent.id)

      // Najít billing record podle payment intent ID
      const billingRecord = await prisma.billingRecord.findFirst({
        where: {
          paymentIntentId: paymentIntent.id,
          status: 'pending'
        }
      })

      if (!billingRecord) {
        console.log('⚠️ Billing record not found for payment:', paymentIntent.id)
        return NextResponse.json({ received: true })
      }

      // Aktualizovat billing record na completed
      await prisma.billingRecord.update({
        where: { id: billingRecord.id },
        data: {
          status: 'completed',
          processedAt: new Date()
        }
      })

      // Přidat kredit do company balance
      await prisma.company.update({
        where: { id: billingRecord.companyId },
        data: {
          balance: {
            increment: billingRecord.amount
          }
        }
      })

      console.log(`✅ Added $${billingRecord.amount} credits to company ${billingRecord.companyId}`)
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object
      
      console.log('❌ Payment failed:', paymentIntent.id)

      // Aktualizovat billing record na failed
      await prisma.billingRecord.updateMany({
        where: {
          paymentIntentId: paymentIntent.id,
          status: 'pending'
        },
        data: {
          status: 'failed',
          processedAt: new Date()
        }
      })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
} 