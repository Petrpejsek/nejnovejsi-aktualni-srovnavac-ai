import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

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

// Promotional offers configuration
const PROMOTIONAL_OFFERS = {
  'starter-100': { amount: 100, bonus: 100, description: 'Welcome Bonus - Double your first deposit' },
  'growth-500': { amount: 500, bonus: 100, description: 'Growth Package - Extra $100 bonus' },
  'premium-1000': { amount: 1000, bonus: 200, description: 'Premium Package - Extra $200 bonus' },
  'enterprise-2500': { amount: 2500, bonus: 750, description: 'Enterprise Package - Extra $750 bonus' }
}

// GET /api/advertiser/billing - načtení billing informací
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Načtení company s billing informacemi
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        id: true,
        name: true,
        balance: true,
        totalSpent: true,
        autoRecharge: true,
        autoRechargeAmount: true,
        autoRechargeThreshold: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    // Načtení posledních 20 billing záznamů
    const billingRecords = await prisma.billingRecord.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true,
        invoiceNumber: true,
        invoiceUrl: true
      }
    })

    // Statistiky za poslední měsíc
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const monthlyStats = await prisma.billingRecord.aggregate({
      where: {
        companyId: user.companyId,
        createdAt: {
          gte: lastMonth
        },
        type: 'spend'
      },
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          balance: company.balance,
          totalSpent: company.totalSpent,
          autoRecharge: company.autoRecharge,
          autoRechargeAmount: company.autoRechargeAmount,
          autoRechargeThreshold: company.autoRechargeThreshold
        },
        transactions: billingRecords,
        monthlySpend: monthlyStats._sum.amount || 0
      }
    })

  } catch (error) {
    console.error('Error fetching billing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}

// POST /api/advertiser/billing - přidání finančních prostředků nebo nastavení auto-recharge
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
    const { action, offerId, paymentMethod, autoRecharge, autoRechargeAmount, autoRechargeThreshold } = data

    // Auto-recharge settings
    if (action === 'auto-recharge') {
      // Validace
      if (autoRecharge && (!autoRechargeAmount || !autoRechargeThreshold)) {
        return NextResponse.json(
          { success: false, error: 'Auto-recharge amount and threshold are required' },
          { status: 400 }
        )
      }

      if (autoRechargeAmount && autoRechargeAmount < 50) {
        return NextResponse.json(
          { success: false, error: 'Minimum auto-recharge amount is $50' },
          { status: 400 }
        )
      }

      // Aktualizace nastavení
      await prisma.company.update({
        where: { id: user.companyId },
        data: {
          autoRecharge,
          autoRechargeAmount: autoRecharge ? autoRechargeAmount : null,
          autoRechargeThreshold: autoRecharge ? autoRechargeThreshold : null
        }
      })

      console.log(`💳 Auto-recharge updated for company ${user.companyId}:`, { autoRecharge, autoRechargeAmount, autoRechargeThreshold })

      return NextResponse.json({
        success: true,
        message: 'Auto-recharge settings updated successfully'
      })
    }

    // Add funds with promotional offers
    if (action === 'add-funds') {
      if (!offerId || !PROMOTIONAL_OFFERS[offerId as keyof typeof PROMOTIONAL_OFFERS]) {
        return NextResponse.json(
          { success: false, error: 'Invalid offer selected' },
          { status: 400 }
        )
      }

      const offer = PROMOTIONAL_OFFERS[offerId as keyof typeof PROMOTIONAL_OFFERS]
      
      // In real implementation, here would be payment processor integration
      // For now, we'll simulate a successful payment
      
      const company = await prisma.company.findUnique({
        where: { id: user.companyId },
        select: { balance: true, totalSpent: true }
      })

      if (!company) {
        return NextResponse.json(
          { success: false, error: 'Company not found' },
          { status: 404 }
        )
      }

      const baseAmount = offer.amount
      const bonusAmount = offer.bonus
      const totalAmount = baseAmount + bonusAmount

      // Check if this is first time user (for welcome bonus validation)
      const isFirstTime = company.totalSpent === 0

      // Apply additional first-time bonus if applicable
      let finalBonusAmount = bonusAmount
      if (offerId === 'starter-100' && !isFirstTime) {
        // Welcome bonus only for first-time users
        finalBonusAmount = 0
      }

      const finalTotalAmount = baseAmount + finalBonusAmount

      // Update company balance
      await prisma.company.update({
        where: { id: user.companyId },
        data: {
          balance: {
            increment: finalTotalAmount
          }
        }
      })

      // Create billing record for the deposit
      await prisma.billingRecord.create({
        data: {
          companyId: user.companyId,
          type: 'deposit',
          amount: baseAmount,
          description: `Deposit - ${offer.description}`,
          paymentMethod: paymentMethod || 'card',
          status: 'completed',
          invoiceNumber: `INV-${Date.now()}`
        }
      })

      // Create billing record for the bonus if applicable
      if (finalBonusAmount > 0) {
        await prisma.billingRecord.create({
          data: {
            companyId: user.companyId,
            type: 'bonus',
            amount: finalBonusAmount,
            description: `Promotional bonus - ${offer.description}`,
            status: 'completed'
          }
        })
      }

      console.log(`💰 Funds added for company ${user.companyId}: $${baseAmount} + $${finalBonusAmount} bonus`)

      return NextResponse.json({
        success: true,
        message: 'Funds added successfully',
        data: {
          baseAmount,
          bonusAmount: finalBonusAmount,
          totalAdded: finalTotalAmount,
          newBalance: company.balance + finalTotalAmount
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error processing billing request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 