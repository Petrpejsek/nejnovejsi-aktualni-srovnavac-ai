import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Fraud protection - limit per IP
const IP_LIMITS = {
  maxImpressionsPerHour: 100,
  maxClicksPerHour: 10
}

// GET /api/ads/auction - auction pro zobrazení reklam
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType') || 'homepage' // homepage, category, search
    const categorySlug = searchParams.get('category')
    const searchQuery = searchParams.get('q')
    const maxAds = parseInt(searchParams.get('maxAds') || '3')
    
    // IP tracking pro fraud protection
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    
    // Kontrola IP limitů
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    
    const [recentImpressions, recentClicks] = await Promise.all([
      prisma.adImpression.count({
        where: {
          ipAddress: clientIP,
          displayedAt: { gte: oneHourAgo }
        }
      }),
      prisma.adClick.count({
        where: {
          ipAddress: clientIP,
          clickedAt: { gte: oneHourAgo }
        }
      })
    ])
    
    // Blokovat podezřelé IP
    if (recentImpressions > IP_LIMITS.maxImpressionsPerHour || 
        recentClicks > IP_LIMITS.maxClicksPerHour) {
      console.log(`🚫 IP ${clientIP} blocked - too many impressions/clicks`)
      return NextResponse.json({
        success: true,
        data: { ads: [] } // Vrátit prázdné reklamy
      })
    }

    // Najít eligible kampaně
    const eligibleCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'active',
        isApproved: true,
        Company: {
          status: 'active',
          balance: { gt: 0 } // Pouze firmy s kreditem
        }
      },
      include: {
        Company: true
      }
    })

    if (eligibleCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        data: { ads: [] }
      })
    }

    // Kontrola daily budget limitu
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const campaignsWithBudgetCheck = await Promise.all(
      eligibleCampaigns.map(async (campaign) => {
        // Kolik už dnes utratil
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

        return {
          ...campaign,
          spentToday,
          remainingBudget,
          canSpend: remainingBudget > campaign.bidAmount // Může si dovolit alespoň jeden klik
        }
      })
    )

    // Filtrovat kampaně které mají budget
    const viableCampaigns = campaignsWithBudgetCheck.filter(c => c.canSpend)

    if (viableCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        data: { ads: [] }
      })
    }

    // Auction algoritmus - seřadit podle bid amount (highest first)
    const sortedCampaigns = viableCampaigns.sort((a, b) => b.bidAmount - a.bidAmount)
    
    // Vzít top N kampaní
    const winningCampaigns = sortedCampaigns.slice(0, maxAds)

    // Získat product informace pro vítězné kampaně
    const productIds = winningCampaigns.map(c => c.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        category: true
      }
    })

    // Sestavit ad data
    const adsToShow = winningCampaigns.map((campaign, index) => {
      const product = products.find(p => p.id === campaign.productId)
      
      return {
        campaignId: campaign.id,
        companyId: campaign.companyId,
        companyName: campaign.Company.name,
        productId: campaign.productId,
        productName: product?.name || 'Unknown Product',
        productDescription: product?.description,
        productImage: product?.imageUrl,
        targetUrl: campaign.targetUrl,
        bidAmount: campaign.bidAmount,
        position: index + 1, // 1 = první pozice
        isSponsored: true
      }
    })

    // Zaznamenat impressions pro všechny zobrazené reklamy
    const impressionData = adsToShow.map(ad => ({
      id: uuidv4(),
      campaignId: ad.campaignId,
      position: ad.position,
      pageType,
      categorySlug: categorySlug || null,
      ipAddress: clientIP,
      country: null, // TODO: Detekce země z IP
      displayedAt: new Date()
    }))

    await prisma.adImpression.createMany({
      data: impressionData
    })

    // Aktualizovat cached impression counts
    for (const ad of adsToShow) {
      await prisma.campaign.update({
        where: { id: ad.campaignId },
        data: {
          todayImpressions: { increment: 1 },
          totalImpressions: { increment: 1 }
        }
      })
    }

    console.log(`📊 Served ${adsToShow.length} ads on ${pageType} page to IP ${clientIP}`)

    return NextResponse.json({
      success: true,
      data: {
        ads: adsToShow,
        pageType,
        totalEligible: viableCampaigns.length
      }
    })

  } catch (error) {
    console.error('Error in ad auction:', error)
    return NextResponse.json(
      { success: false, error: 'Ad auction failed' },
      { status: 500 }
    )
  }
} 