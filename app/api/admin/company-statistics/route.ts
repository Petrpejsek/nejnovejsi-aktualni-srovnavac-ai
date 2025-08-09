import { PrismaClient } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'
    const startDate = (() => {
      const now = new Date()
      switch (timeframe) {
        case 'day':
          return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
        case 'week':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case 'quarter':
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        case 'year':
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        case 'month':
        default:
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    })()

    // Reálné statistiky z DB
    const [totalCompanies, companiesWithBalanceAgg, activeCompanies, recentCompaniesAgg, totalBalanceAgg] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { balance: { gt: 0 } } }),
      prisma.company.count({ where: { status: 'active' } }),
      prisma.company.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      }),
      prisma.company.aggregate({ _sum: { balance: true } })
    ])

    const totalBalance = totalBalanceAgg._sum.balance || 0
    const avgBalance = totalCompanies > 0 ? totalBalance / totalCompanies : 0

    // Top podle skutečného zůstatku
    const topSpendingCompanies = await prisma.company.findMany({
      orderBy: { balance: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        autoRecharge: true,
        autoRechargeThreshold: true,
        autoRechargeAmount: true,
        createdAt: true
      }
    })

    // Distribuce kreditů (reálné koše)
    const ranges = [
      { label: 'No Balance', where: { balance: 0 } },
      { label: '$1-50', where: { balance: { gt: 0, lte: 50 } } },
      { label: '$51-100', where: { balance: { gt: 100 - 49, lte: 100 } } },
      { label: '$101-500', where: { balance: { gt: 100, lte: 500 } } },
      { label: '$501-1000', where: { balance: { gt: 500, lte: 1000 } } },
      { label: '$1000+', where: { balance: { gt: 1000 } } }
    ]
    const balanceDistribution = [] as Array<{ range: string; count: number }>
    for (const r of ranges) {
      const count = await prisma.company.count({ where: r.where as any })
      balanceDistribution.push({ range: r.label, count })
    }

    // Auto-payment stats (reálné)
    const [autoEnabled, autoDisabled, avgThresholdAgg, avgAmountAgg] = await Promise.all([
      prisma.company.count({ where: { autoRecharge: true } }),
      prisma.company.count({ where: { autoRecharge: false } }),
      prisma.company.aggregate({ _avg: { autoRechargeThreshold: true } }),
      prisma.company.aggregate({ _avg: { autoRechargeAmount: true } })
    ])

    // Denní limity – pokud máte sloupec dailyBudget v Campaign, spočti firmy s nastavenými limity
    const companiesWithLimits = await prisma.company.count({
      where: {
        Campaign: { some: { dailyBudget: { gt: 0 } as any } }
      }
    })
    const dailyLimitStats = {
      companiesWithLimits,
      avgDailyLimit: 0,
      totalDailyLimitCapacity: 0
    }

    const latestCompanies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, balance: true, autoRecharge: true, createdAt: true }
    })

    // Affiliate statistics (real data)
    const [affiliateClicks, affiliateConversions, affiliateCommissionAgg] = await Promise.all([
      prisma.affiliate_clicks.count({ where: { timestamp: { gte: startDate } } }),
      prisma.affiliate_conversions.count({ where: { timestamp: { gte: startDate }, is_billable: true } }),
      prisma.affiliate_conversions.aggregate({
        where: { timestamp: { gte: startDate }, is_billable: true },
        _sum: { commission_amount: true }
      })
    ])

    // Top partners by clicks + enrich with conversions/commission
    const topPartnerClicks = await prisma.affiliate_clicks.groupBy({
      by: ['partner_id'],
      where: { timestamp: { gte: startDate } },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } as any },
      take: 5
    })
    const partnerConversions = await prisma.affiliate_conversions.groupBy({
      by: ['partner_id'],
      where: { timestamp: { gte: startDate }, is_billable: true },
      _count: { _all: true },
      _sum: { commission_amount: true }
    })
    const partnerConvMap = new Map<string, { conv: number; commission: number }>()
    partnerConversions.forEach((r: any) => {
      partnerConvMap.set(r.partner_id, { conv: r._count._all, commission: r._sum.commission_amount || 0 })
    })
    const topPartners = topPartnerClicks.map((c: any) => {
      const extra = partnerConvMap.get(c.partner_id) || { conv: 0, commission: 0 }
      return {
        partnerId: c.partner_id,
        clicks: c._count._all,
        conversions: extra.conv,
        commission: extra.commission
      }
    })

    // Top ref codes
    const topRefClicks = await prisma.affiliate_clicks.groupBy({
      by: ['ref_code'],
      where: { timestamp: { gte: startDate } },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } as any },
      take: 5
    })
    const refConversions = await prisma.affiliate_conversions.groupBy({
      by: ['ref_code'],
      where: { timestamp: { gte: startDate }, is_billable: true },
      _count: { _all: true },
      _sum: { commission_amount: true }
    })
    const refConvMap = new Map<string, { conv: number; commission: number }>()
    refConversions.forEach((r: any) => {
      refConvMap.set(r.ref_code, { conv: r._count._all, commission: r._sum.commission_amount || 0 })
    })
    const topRefCodes = topRefClicks.map((c: any) => {
      const extra = refConvMap.get(c.ref_code) || { conv: 0, commission: 0 }
      return {
        refCode: c.ref_code,
        clicks: c._count._all,
        conversions: extra.conv,
        commission: extra.commission
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCompanies,
          companiesWithBalance: companiesWithBalanceAgg,
          activeCompanies,
          recentCompanies: recentCompaniesAgg,
          totalBalance,
          avgBalance
        },
        balanceDistribution,
        topSpendingCompanies,
        autoPaymentStats: {
          enabled: autoEnabled,
          disabled: autoDisabled,
          avgThreshold: avgThresholdAgg._avg.autoRechargeThreshold || 0,
          avgAmount: avgAmountAgg._avg.autoRechargeAmount || 0
        },
        dailyLimitStats,
        latestCompanies,
        affiliate: {
          totalClicks: affiliateClicks,
          conversions: affiliateConversions,
          commission: affiliateCommissionAgg._sum.commission_amount || 0,
          conversionRate: affiliateClicks > 0 ? (affiliateConversions / affiliateClicks) * 100 : 0,
          topPartners,
          topRefCodes
        },
        spendingTrends: { daily: [], weekly: [], monthly: [] },
        timeframe,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching company statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání statistik firem' },
      { status: 500 }
    )
  }
}