import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseRange(range: string | null): { gte?: Date } {
  if (range === 'today') return { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
  if (range === '7d') return { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  if (range === '30d') return { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  if (range === '90d') return { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  return {}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const createdAt = parseRange(range)
    const companyId = params.id

    // 1. Campaign-level data
    const campaigns = await prisma.campaign.findMany({
      where: { companyId },
      include: {
        AdClick: {
          where: createdAt.gte ? { clickedAt: createdAt as any } : {},
          select: {
            id: true,
            costPerClick: true,
            isValidClick: true,
            country: true,
            clickedAt: true,
            ipAddress: true,
            userAgent: true
          }
        }
      },
      orderBy: { totalSpent: 'desc' }
    })

    // 2. Aggregate metrics per campaign
    const campaignMetrics = campaigns.map(campaign => {
      const clicks = campaign.AdClick
      const validClicks = clicks.filter(c => c.isValidClick)
      const totalSpend = validClicks.reduce((sum, c) => sum + Number(c.costPerClick || 0), 0)
      const avgCpc = validClicks.length > 0 ? totalSpend / validClicks.length : 0
      
      // Mock CTR a conversion rate (reálně by bylo z impression data + conversions)
      const mockImpressions = validClicks.length * (20 + Math.random() * 30) // 20-50x click-to-impression ratio
      const ctr = mockImpressions > 0 ? (validClicks.length / mockImpressions) * 100 : 0
      const conversionRate = Math.random() * 5 + 1 // 1-6% conversion rate

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        isApproved: campaign.isApproved,
        refCode: campaign.name.replace(/\s+/g, '').slice(0, 6).toUpperCase(), // Mock ref code
        clicks: validClicks.length,
        invalidClicks: clicks.length - validClicks.length,
        spend: totalSpend,
        avgCpc,
        ctr,
        conversionRate,
        dailyBudget: Number(campaign.dailyBudget || 0),
        totalBudget: Number(campaign.totalBudget || 0)
      }
    })

    // 3. Geographic breakdown
    const allClicks = campaigns.flatMap(c => c.AdClick.filter(click => click.isValidClick))
    const geoBreakdown = allClicks.reduce((acc: any, click) => {
      const country = click.country || 'Unknown'
      if (!acc[country]) acc[country] = { clicks: 0, spend: 0 }
      acc[country].clicks++
      acc[country].spend += Number(click.costPerClick || 0)
      return acc
    }, {})

    // 4. Time pattern analysis
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourClicks = allClicks.filter(click => 
        new Date(click.clickedAt).getHours() === hour
      )
      return {
        hour,
        clicks: hourClicks.length,
        spend: hourClicks.reduce((sum, c) => sum + Number(c.costPerClick || 0), 0)
      }
    })

    // 5. Fraud detection
    const ipFrequency = allClicks.reduce((acc: any, click) => {
      acc[click.ipAddress] = (acc[click.ipAddress] || 0) + 1
      return acc
    }, {})
    const suspiciousIPs = Object.entries(ipFrequency)
      .filter(([_, count]) => (count as number) > 10)
      .map(([ip, count]) => ({ ip, count }))

    // 6. Daily timeline for last 14 days
    const timeline = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayClicks = allClicks.filter(click => {
        const clickDate = new Date(click.clickedAt)
        return clickDate >= dayStart && clickDate <= dayEnd
      })
      
      return {
        date: dayStart.toISOString().split('T')[0],
        clicks: dayClicks.length,
        spend: dayClicks.reduce((sum, c) => sum + Number(c.costPerClick || 0), 0)
      }
    }).reverse()

    // 7. Overall KPIs
    const totalClicks = allClicks.length
    const totalSpend = allClicks.reduce((sum, c) => sum + Number(c.costPerClick || 0), 0)
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
    const activeCampaigns = campaigns.filter(c => c.status === 'active' && c.isApproved).length

    return NextResponse.json({
      range,
      kpis: {
        totalSpend,
        totalClicks,
        avgCpc,
        activeCampaigns: activeCampaigns,
        totalCampaigns: campaigns.length,
        fraudRate: totalClicks > 0 ? ((totalClicks - allClicks.length) / totalClicks) * 100 : 0
      },
      campaigns: campaignMetrics,
      geoBreakdown,
      hourlyPattern: hourlyData,
      timeline,
      fraudDetection: {
        suspiciousIPs,
        blockedToday: suspiciousIPs.length
      },
      refCodes: campaignMetrics.map(c => ({
        code: c.refCode,
        campaignName: c.name,
        clicks: c.clicks,
        conversionRate: c.conversionRate,
        cpc: c.avgCpc,
        landingPage: `/products/campaign/${c.id}` // Mock landing page
      }))
    })

  } catch (e) {
    console.error('CPC detailed error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
