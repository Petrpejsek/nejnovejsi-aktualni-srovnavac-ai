import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/ads/click - zpracování kliku na reklamu
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { campaignId, productId } = data
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // IP tracking pro fraud protection
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || null

    // Najít kampaň s company informacemi
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            balance: true,
            status: true
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Ověření že kampaň je aktivní
    if (campaign.status !== 'active' || !campaign.isApproved) {
      return NextResponse.json(
        { success: false, error: 'Campaign is not active' },
        { status: 400 }
      )
    }

    // Ověření že firma má dostatečný balance
    if (campaign.company.balance < campaign.bidAmount) {
      console.log(`❌ Insufficient balance for campaign ${campaignId}`)
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Fraud detection - kontrola duplicitních kliků ze stejné IP
    const fiveMinutesAgo = new Date()
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

    const recentClickFromIP = await prisma.adClick.findFirst({
      where: {
        campaignId: campaignId,
        ipAddress: clientIP,
        clickedAt: { gte: fiveMinutesAgo }
      }
    })

    let isValidClick = true
    let fraudReason = null

    if (recentClickFromIP) {
      isValidClick = false
      fraudReason = 'Duplicate click from same IP within 5 minutes'
      console.log(`🚫 Fraud detected: ${fraudReason} - IP: ${clientIP}`)
    }

    // Kontrola daily budget limitu
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaySpend = await prisma.billingRecord.aggregate({
      where: {
        companyId: campaign.companyId,
        campaignId: campaign.id,
        type: 'spend',
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    })

    const spentToday = todaySpend._sum.amount || 0
    const remainingBudget = campaign.dailyBudget - spentToday

    if (remainingBudget < campaign.bidAmount) {
      console.log(`📊 Daily budget exceeded for campaign ${campaignId}`)
      
      // Automaticky pozastavit kampaň pokud překročí budget
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'paused' }
      })
      
      return NextResponse.json(
        { success: false, error: 'Daily budget exceeded' },
        { status: 400 }
      )
    }

    // Začít transakci pro atomické zpracování
    const result = await prisma.$transaction(async (tx) => {
      // 1. Zaznamenat klik
      const clickRecord = await tx.adClick.create({
        data: {
          campaignId: campaign.id,
          companyId: campaign.companyId,
          ipAddress: clientIP,
          userAgent,
          referrer,
          costPerClick: isValidClick ? campaign.bidAmount : 0,
          isValidClick,
          fraudReason,
          clickedAt: new Date()
        }
      })

      // 2. Pokud je klik validní, odečíst z balance a vytvořit billing record
      if (isValidClick) {
        // Odečíst z company balance
        await tx.company.update({
          where: { id: campaign.companyId },
          data: {
            balance: { decrement: campaign.bidAmount },
            totalSpent: { increment: campaign.bidAmount }
          }
        })

        // Vytvořit billing record
        await tx.billingRecord.create({
          data: {
            companyId: campaign.companyId,
            type: 'spend',
            amount: campaign.bidAmount,
            description: `Click cost for campaign: ${campaign.name}`,
            campaignId: campaign.id,
            clickId: clickRecord.id,
            status: 'completed'
          }
        })

        // Aktualizovat campaign statistiky
        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            todayClicks: { increment: 1 },
            totalClicks: { increment: 1 },
            todaySpent: { increment: campaign.bidAmount },
            totalSpent: { increment: campaign.bidAmount }
          }
        })
      } else {
        // I pro fraudulent clicks aktualizujeme některé statistiky (ale bez platby)
        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            todayClicks: { increment: 1 },
            totalClicks: { increment: 1 }
          }
        })
      }

      return clickRecord
    })

    if (isValidClick) {
      console.log(`💰 Valid click processed: Campaign ${campaignId}, Cost: $${campaign.bidAmount}, IP: ${clientIP}`)
    } else {
      console.log(`⚠️ Fraudulent click recorded: Campaign ${campaignId}, Reason: ${fraudReason}, IP: ${clientIP}`)
    }

    // Vrátit redirect URL
    return NextResponse.json({
      success: true,
      data: {
        clickId: result.id,
        targetUrl: campaign.targetUrl,
        costPerClick: isValidClick ? campaign.bidAmount : 0,
        isValidClick,
        fraudReason
      }
    })

  } catch (error) {
    console.error('Error processing ad click:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process click' },
      { status: 500 }
    )
  }
} 