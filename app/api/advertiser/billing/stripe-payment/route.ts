import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'

const prisma = new PrismaClient()

// Inicializace Stripe (pozor: potřebujete přidat STRIPE_SECRET_KEY do .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

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