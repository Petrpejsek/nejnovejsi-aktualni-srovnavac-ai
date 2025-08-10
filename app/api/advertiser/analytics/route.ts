import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering  
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// GET /api/advertiser/analytics - načtení detailních analytics
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    if (!token || token.role !== 'company' || !token.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d

    // Resolve company by email
    const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true } })
    if (!company) {
      return NextResponse.json({
        success: true,
        data: { summary: { totalSpend: 0, totalClicks: 0, totalImpressions: 0, averageCPC: 0, averageCTR: 0, activeCampaigns: 0 }, campaignPerformance: [], chartData: { clicksPerDay: [], impressionsPerDay: [], spendPerDay: [] } }
      })
    }

    // Načtení kampaní firmy
    const campaigns = await prisma.campaign.findMany({ where: { companyId: company.id } })

    const campaignIds = campaigns.map(c => c.id)

    if (campaignIds.length === 0) {
      return NextResponse.json({
        success: true,
    data: { summary: { totalSpend: 0, totalClicks: 0, totalImpressions: 0, averageCPC: 0, averageCTR: 0, activeCampaigns: 0 }, campaignPerformance: [], chartData: { clicksPerDay: [], impressionsPerDay: [], spendPerDay: [] } }
      })
    }

    // Výpočet dat pro období
    let days = 30
    switch (period) {
      case '7d':
        days = 7
        break
      case '30d':
        days = 30
        break
      case '90d':
        days = 90
        break
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Aggregate statistiky pro období
    const [clickStats, impressionStats] = await Promise.all([
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

    // Spend per day – použijeme součet costPerClick z AdClick (spolehlivější než BillingRecord)
    const spendPerDayClicks = await prisma.adClick.groupBy({
      by: ['clickedAt'],
      where: {
        campaignId: { in: campaignIds },
        clickedAt: { gte: startDate },
        isValidClick: true
      },
      _sum: { costPerClick: true }
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
    const totalSpend = Math.abs(clickStats._sum.costPerClick || 0)
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0
    const activeCampaigns = campaigns.filter(c => c.status === 'active' && c.isApproved).length

    // Transform chart data to expected format
    const transformedClicksPerDay = clicksPerDay.map(item => ({
      date: item.clickedAt.toISOString().split('T')[0],
      clicks: item._count.id
    }))

    const transformedImpressionsPerDay = impressionsPerDay.map(item => ({
      date: item.displayedAt.toISOString().split('T')[0],
      impressions: item._count.id
    }))

    const transformedSpendPerDay = spendPerDayClicks.map(item => ({
      date: item.clickedAt.toISOString().split('T')[0],
      spend: Math.abs(item._sum.costPerClick || 0)
    }))

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSpend,
          totalClicks,
          totalImpressions,
          averageCPC,
          averageCTR,
          activeCampaigns
        },
        campaignPerformance,
        chartData: {
          clicksPerDay: transformedClicksPerDay,
          impressionsPerDay: transformedImpressionsPerDay,
          spendPerDay: transformedSpendPerDay
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