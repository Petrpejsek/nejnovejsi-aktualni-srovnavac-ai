import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST /api/ads/click - zpracování kliku na reklamu
export async function POST(request: NextRequest) {
  try {
    const { productId, campaignId } = await request.json()

    console.log('💰 PPC Click API called:', { productId, campaignId })

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // 1. Najdeme produkt
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 2. Najdeme aktivní kampaň pro tento produkt
    let activeCampaign = null
    if (campaignId) {
      // Pokud je zadané konkrétní campaignId
      activeCampaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          productId: productId,
          status: 'active',
          isApproved: true
        },
        include: {
          Company: true
        }
      })
    } else {
      // Jinak vezmeme první aktivní kampaň pro tento produkt
      activeCampaign = await prisma.campaign.findFirst({
        where: {
          productId: productId,
          status: 'active',
          isApproved: true
        },
        include: {
          Company: true
        }
      })
    }

    if (!activeCampaign) {
      console.log('⚠️ No active campaign found for product:', productId)
      return NextResponse.json({ error: 'No active campaign found for this product' }, { status: 404 })
    }

    // 2. Check company credit
    const company = activeCampaign.Company
    if (company.balance < activeCampaign.bidAmount) {
      console.log('💸 Insufficient balance - PAUSING CAMPAIGN:', { 
        balance: company.balance, 
        cpc: activeCampaign.bidAmount,
        campaignId: activeCampaign.id,
        campaignName: activeCampaign.name
      })
      
      // AUTOMATICKY PAUZUJEME KAMPAŇ když dojde kredit
      await prisma.campaign.update({
        where: { id: activeCampaign.id },
        data: { 
          status: 'paused'
        }
      })
      
      console.log('⏸️ Campaign automatically paused due to insufficient balance:', activeCampaign.id)
      
      return NextResponse.json({ 
        error: 'Insufficient company balance', 
        campaignPaused: true,
        campaignId: activeCampaign.id 
      }, { status: 402 })
    }

    // 3. Check campaign daily budget (with 20% reserve)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaySpent = await prisma.adClick.aggregate({
      where: {
        campaignId: activeCampaign.id,
        clickedAt: {
          gte: today
        }
      },
      _sum: {
        costPerClick: true
      }
    })

    const dailySpent = todaySpent._sum.costPerClick || 0
    const budgetWithReserve = activeCampaign.dailyBudget * 1.2 // 20% rezerva
    
    // Kontrola s rezervou - pouze při překročení 120% zastavíme
    if (dailySpent + activeCampaign.bidAmount > budgetWithReserve) {
      console.log('📊 Daily budget exceeded (with reserve):', { 
        dailySpent, 
        cpc: activeCampaign.bidAmount, 
        budget: activeCampaign.dailyBudget,
        budgetWithReserve,
        wouldSpend: dailySpent + activeCampaign.bidAmount
      })
      return NextResponse.json({ 
        error: 'Daily budget exceeded', 
        dailySpent, 
        dailyBudget: activeCampaign.dailyBudget,
        budgetWithReserve 
      }, { status: 402 })
    }

    // Upozornění při překročení 80% budgetu
    const budgetWarningThreshold = activeCampaign.dailyBudget * 0.8
    let budgetWarning = null
    if (dailySpent + activeCampaign.bidAmount > budgetWarningThreshold) {
      budgetWarning = {
        level: dailySpent + activeCampaign.bidAmount > activeCampaign.dailyBudget ? 'critical' : 'warning',
        message: dailySpent + activeCampaign.bidAmount > activeCampaign.dailyBudget 
          ? 'Daily budget exceeded! We recommend increasing the daily limit.' 
          : 'Daily budget approaching limit. Consider increasing the daily limit.',
        spent: dailySpent + activeCampaign.bidAmount,
        budget: activeCampaign.dailyBudget,
        percentage: Math.round(((dailySpent + activeCampaign.bidAmount) / activeCampaign.dailyBudget) * 100)
      }
    }

    // 4. Process payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credit from company
      const updatedCompany = await tx.company.update({
        where: { id: company.id },
        data: {
          balance: {
            decrement: activeCampaign.bidAmount
          }
        }
      })

      // 🔄 AUTO-RECHARGE: Check if balance is below threshold and auto-recharge is enabled
      const newBalance = updatedCompany.balance
      const autoRechargeThreshold = company.autoRechargeThreshold || 50
      const autoRechargeAmount = company.autoRechargeAmount || 200
      
      if (newBalance < autoRechargeThreshold && company.autoRecharge && autoRechargeAmount > 0) {
        console.log('🔄 Auto-recharge triggered:', { 
          currentBalance: newBalance, 
          threshold: autoRechargeThreshold,
          rechargeAmount: autoRechargeAmount,
          companyId: company.id,
          companyName: company.name 
        })
        
        await tx.company.update({
          where: { id: company.id },
          data: {
            balance: {
              increment: autoRechargeAmount
            }
          }
        })

        // Create billing record for the auto-recharge
        await tx.billingRecord.create({
          data: {
            id: uuidv4(),
            companyId: company.id,
            amount: autoRechargeAmount,
            type: 'auto_recharge',
            description: `Automatic recharge when balance dropped to $${newBalance.toFixed(2)} (threshold: $${autoRechargeThreshold})`,
            status: 'completed',
            createdAt: new Date()
          }
        })

        console.log('✅ Auto-recharge completed:', { 
          previousBalance: newBalance,
          rechargedAmount: autoRechargeAmount,
          newBalance: newBalance + autoRechargeAmount
        })
      }

      // Record paid click
      const adClick = await tx.adClick.create({
        data: {
          id: uuidv4(),
          campaignId: activeCampaign.id,
          companyId: company.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || null,
          costPerClick: activeCampaign.bidAmount,
          clickedAt: new Date()
        }
      })

      // Spočítáme aktuální denní statistiky z databáze (včetně právě vytvořeného kliku)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayStats = await tx.adClick.aggregate({
        where: {
          campaignId: activeCampaign.id,
          clickedAt: {
            gte: today
          }
        },
        _sum: {
          costPerClick: true
        },
        _count: {
          id: true
        }
      })
      
      // todayStats už obsahuje právě vytvořený klik, takže nepřičítáme znovu
      const newTodaySpent = todayStats._sum.costPerClick || 0
      const newTodayClicks = todayStats._count.id || 0

      console.log('📊 Updating campaign statistics:', {
        campaignId: activeCampaign.id,
        newTodaySpent,
        newTodayClicks,
        cpc: activeCampaign.bidAmount
      })

      // Aktualizujeme statistiky kampaně
      await tx.campaign.update({
        where: { id: activeCampaign.id },
        data: {
          totalSpent: {
            increment: activeCampaign.bidAmount
          },
          totalClicks: {
            increment: 1
          },
          todaySpent: newTodaySpent,
          todayClicks: newTodayClicks
        }
      })

      return adClick
    })

    // 5. Zaznamenáme také do obecných kliků pro statistiky
    try {
      const session = await getServerSession(authOptions)
      
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })

        if (user) {
          await prisma.clickHistory.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              productId,
              productName: product.name,
              category: product.category,
              imageUrl: product.imageUrl,
              price: product.price,
              externalUrl: product.externalUrl || ''
            }
          })
        }
      }
    } catch (trackingError) {
      console.log('📊 Non-critical tracking error:', trackingError)
      // Pokračujeme i pokud se tracking nepovede
    }

    console.log('✅ PPC click processed successfully:', {
      campaignId: activeCampaign.id,
      cost: activeCampaign.bidAmount,
      newBalance: company.balance - activeCampaign.bidAmount,
      budgetWarning: budgetWarning ? budgetWarning.level : 'none'
    })

    return NextResponse.json({ 
      success: true,
      cost: activeCampaign.bidAmount,
      campaignName: activeCampaign.name,
      remainingBalance: company.balance - activeCampaign.bidAmount,
      redirectUrl: product.externalUrl,
      budgetWarning: budgetWarning
    })

  } catch (error) {
    console.error('💥 Error processing PPC click:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 