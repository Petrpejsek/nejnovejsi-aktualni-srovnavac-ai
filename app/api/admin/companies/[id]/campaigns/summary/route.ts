import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function parseRange(range: string | null): { gte?: Date } {
  const now = new Date()
  if (!range || range === 'all') return {}
  if (range === 'today') return { gte: new Date(now.setHours(0,0,0,0)) }
  if (range === '7d') return { gte: new Date(Date.now() - 7*24*60*60*1000) }
  if (range === '30d') return { gte: new Date(Date.now() - 30*24*60*60*1000) }
  if (range === '90d') return { gte: new Date(Date.now() - 90*24*60*60*1000) }
  return {}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const createdAt = parseRange(range)
    const companyId = params.id

    const campaigns = await prisma.campaign.findMany({
      where: { companyId },
      select: {
        id: true, name: true, status: true, isApproved: true,
        dailyBudget: true, totalSpent: true, todaySpent: true,
        totalClicks: true, totalImpressions: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = campaigns.length
    const active = campaigns.filter(c => c.status === 'active' && !!c.isApproved).length
    const paused = campaigns.filter(c => c.status !== 'active').length
    const pendingApproval = campaigns.filter(c => !c.isApproved).length

    const totalClicks = campaigns.reduce((s,c)=>s+(c.totalClicks||0),0)
    const totalImpr = campaigns.reduce((s,c)=>s+(c.totalImpressions||0),0)
    const ctr = totalImpr>0 ? (totalClicks/totalImpr)*100 : 0

    const budgetDaily = campaigns.reduce((s,c)=>s+(Number(c.dailyBudget||0)),0)
    const spendToday = campaigns.reduce((s,c)=>s+(Number(c.todaySpent||0)),0)

    // Spend v období z BillingRecord (typ spend)
    const spendAgg = await prisma.billingRecord.aggregate({
      where: { companyId, type: 'spend', ...(createdAt.gte ? { createdAt: createdAt as any } : {}) },
      _sum: { amount: true }
    })
    const spendRange = Number(spendAgg._sum.amount || 0)

    const topCampaigns = campaigns
      .slice()
      .sort((a,b)=>Number(b.totalSpent||0)-Number(a.totalSpent||0))
      .slice(0,5)

    return NextResponse.json({
      range,
      summary: {
        total, active, paused, pendingApproval,
        totalClicks, totalImpressions: totalImpr, ctr,
        budgetDaily, spendToday, spendRange,
      },
      topCampaigns
    })
  } catch (e) {
    console.error('campaigns summary error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


