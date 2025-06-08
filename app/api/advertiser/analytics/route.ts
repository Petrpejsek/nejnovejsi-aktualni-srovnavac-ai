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

// GET /api/advertiser/analytics - načtení detailních analytics
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const period = searchParams.get('period') || '7days' // 1day, 7days, 30days, all

    // Načtení základních informací o kampani
    let campaigns
    if (campaignId) {
      campaigns = await prisma.campaign.findMany({
        where: { 
          id: campaignId,
          companyId: user.companyId 
        }
      })
    } else {
      campaigns = await prisma.campaign.findMany({
        where: { companyId: user.companyId }
      })
    }

    if (campaigns.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No campaigns found' },
        { status: 404 }
      )
    }

    const campaignIds = campaigns.map(c => c.id)

    // Výpočet dat pro období
    let startDate = new Date()
    switch (period) {
      case '1day':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '7days':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'all':
        startDate = new Date('2020-01-01') // Velmi staré datum
        break
    }

    // Aggregate statistiky pro období
    const [clickStats, impressionStats, spendStats] = await Promise.all([
      // Clicks
      prisma.adClick.aggregate({
        where: {
          campaignId: { in: campaignIds },
          clickedAt: { gte: startDate },
          isValidClick: true
        },
        _sum: { costPerClick: true },
        _count: { id: true }
      }),
      
      // Impressions
      prisma.adImpression.aggregate({
        where: {
          campaignId: { in: campaignIds },
          displayedAt: { gte: startDate }
        },
        _count: { id: true }
      }),
      
      // Spend per day (pro graf)
      prisma.billingRecord.groupBy({
        by: ['createdAt'],
        where: {
          companyId: user.companyId,
          type: 'spend',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      })
    ])

    // Clicks per day pro graf
    const clicksPerDay = await prisma.adClick.groupBy({
      by: ['clickedAt'],
      where: {
        campaignId: { in: campaignIds },
        clickedAt: { gte: startDate },
        isValidClick: true
      },
      _count: { id: true }
    })

    // Impressions per day pro graf
    const impressionsPerDay = await prisma.adImpression.groupBy({
      by: ['displayedAt'],
      where: {
        campaignId: { in: campaignIds },
        displayedAt: { gte: startDate }
      },
      _count: { id: true }
    })

    // Performance by campaign
    const campaignPerformance = await Promise.all(
      campaigns.map(async (campaign) => {
        const [clicks, impressions] = await Promise.all([
          prisma.adClick.aggregate({
            where: {
              campaignId: campaign.id,
              clickedAt: { gte: startDate },
              isValidClick: true
            },
            _count: { id: true },
            _sum: { costPerClick: true }
          }),
          prisma.adImpression.aggregate({
            where: {
              campaignId: campaign.id,
              displayedAt: { gte: startDate }
            },
            _count: { id: true }
          })
        ])

        const clickCount = clicks._count.id || 0
        const impressionCount = impressions._count.id || 0
        const spend = clicks._sum.costPerClick || 0
        const ctr = impressionCount > 0 ? (clickCount / impressionCount) * 100 : 0
        const avgCpc = clickCount > 0 ? spend / clickCount : 0

        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          isApproved: campaign.isApproved,
          impressions: impressionCount,
          clicks: clickCount,
          spend: Math.round(spend * 100) / 100,
          ctr: Math.round(ctr * 100) / 100,
          avgCpc: Math.round(avgCpc * 100) / 100,
          bidAmount: campaign.bidAmount,
          dailyBudget: campaign.dailyBudget
        }
      })
    )

    // Aggregate totals
    const totalClicks = clickStats._count.id || 0
    const totalImpressions = impressionStats._count.id || 0
    const totalSpend = clickStats._sum.costPerClick || 0
    const totalCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalImpressions,
          totalClicks,
          totalSpend: Math.round(totalSpend * 100) / 100,
          ctr: Math.round(totalCtr * 100) / 100,
          avgCpc: Math.round(avgCpc * 100) / 100,
          campaigns: campaigns.length
        },
        campaigns: campaignPerformance,
        charts: {
          dailySpend: spendStats.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            amount: item._sum.amount || 0
          })),
          dailyClicks: clicksPerDay.map(item => ({
            date: item.clickedAt.toISOString().split('T')[0],
            count: item._count.id
          })),
          dailyImpressions: impressionsPerDay.map(item => ({
            date: item.displayedAt.toISOString().split('T')[0],
            count: item._count.id
          }))
        }
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 