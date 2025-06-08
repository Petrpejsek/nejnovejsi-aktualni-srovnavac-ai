import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'

const prisma = new PrismaClient()

// Funkce pro inicializaci Stripe s error handlingem
function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.')
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-05-28.basil',
  })
}

// Ověření JWT tokenu
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('advertiser-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

// POST /api/advertiser/billing/stripe-payment - vytvoření Stripe payment intent
export async function POST(request: NextRequest) {
  try {
    // Zkontrolovat, zda je Stripe nakonfigurovaný
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Payment processing is temporarily unavailable' },
        { status: 503 }
      )
    }
    
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { amount } = data

    // Validace
    if (!amount || amount < 50) {
      return NextResponse.json(
        { success: false, error: 'Minimum recharge amount is $50' },
        { status: 400 }
      )
    }

    if (amount > 10000) {
      return NextResponse.json(
        { success: false, error: 'Maximum recharge amount is $10,000' },
        { status: 400 }
      )
    }

    // Načtení company informací
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    // Inicializace Stripe instance
    const stripe = getStripeInstance()
    
    // Vytvoření Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe očekává centu
      currency: 'usd',
      metadata: {
        companyId: company.id,
        companyName: company.name,
        type: 'credit_recharge'
      },
      description: `Credit recharge for ${company.name} - $${amount}`,
      receipt_email: company.email
    })

    // Vytvoření pending billing record
    await prisma.billingRecord.create({
      data: {
        companyId: company.id,
        type: 'charge',
        amount: amount,
        description: `Credit recharge - $${amount}`,
        paymentMethod: 'stripe',
        paymentIntentId: paymentIntent.id,
        status: 'pending'
      }
    })

    console.log(`💳 Stripe payment intent created for company ${company.id}: $${amount}`)

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    })

  } catch (error) {
    console.error('Error creating Stripe payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    )
  }
} 