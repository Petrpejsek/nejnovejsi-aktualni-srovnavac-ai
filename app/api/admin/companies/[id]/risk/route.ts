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
    const range = searchParams.get('range') || '30d'
    const createdAt = parseRange(range)
    const companyId = params.id

    // Invalid clicks ratio
    const [totalClicks, invalidClicks] = await Promise.all([
      prisma.ad_clicks_monetization.count({
        where: { partner_id: companyId, ...(createdAt.gte ? { timestamp: createdAt as any } : {}) }
      }),
      prisma.ad_clicks_monetization.count({
        where: { partner_id: companyId, is_valid_click: false, ...(createdAt.gte ? { timestamp: createdAt as any } : {}) }
      })
    ])

    const invalidClicksRatio = totalClicks > 0 ? (invalidClicks / totalClicks) * 100 : 0

    // Trend den/den změna invalid clicks
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [yesterdayTotal, yesterdayInvalid] = await Promise.all([
      prisma.ad_clicks_monetization.count({
        where: { partner_id: companyId, timestamp: { gte: yesterday, lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000) } }
      }),
      prisma.ad_clicks_monetization.count({
        where: { partner_id: companyId, is_valid_click: false, timestamp: { gte: yesterday, lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000) } }
      })
    ])

    const yesterdayRatio = yesterdayTotal > 0 ? (yesterdayInvalid / yesterdayTotal) * 100 : 0
    const dayOverDayChange = invalidClicksRatio - yesterdayRatio

    // Webhook health - použijeme existující pole z Company modelu
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { 
        id: true, name: true, balance: true, createdAt: true,
        assignedProductId: true, status: true 
      }
    })

    // Check conversions za posledních 14 dní
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const recentConversions = await prisma.affiliate_conversions.count({
      where: { partner_id: companyId, timestamp: { gte: fourteenDaysAgo } }
    })

    // Risk flags
    const flags = []
    
    if (company?.balance && company.balance < 10) {
      flags.push({ type: 'low_credit', severity: 'high', message: 'Nízký kredit (< $10)' })
    }
    
    if (recentConversions === 0) {
      flags.push({ type: 'no_conversions', severity: 'medium', message: 'Žádné konverze za 14 dní' })
    }
    
    if (invalidClicksRatio > 15) {
      flags.push({ type: 'high_invalid_clicks', severity: 'high', message: `Vysoký podíl neplatných kliků (${invalidClicksRatio.toFixed(1)}%)` })
    }
    
    // Mock webhook status pro demo (bez webhook pole v Company modelu)
    const mockWebhookStatus = Math.random() > 0.8 ? 'failed' : 'success'
    if (mockWebhookStatus === 'failed') {
      flags.push({ type: 'webhook_failed', severity: 'medium', message: 'Webhook selhává' })
    }

    // Check broken links (mockovaná data pro demo)
    const broken404Ratio = Math.random() * 5 // 0-5% pro demo

    return NextResponse.json({
      range,
      invalidClicks: {
        ratio: invalidClicksRatio,
        total: totalClicks,
        invalid: invalidClicks,
        dayOverDayChange
      },
      webhookHealth: {
        status: mockWebhookStatus,
        lastCall: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random v posledních 7 dnech
        isHealthy: mockWebhookStatus === 'success'
      },
      conversions: {
        recent14d: recentConversions,
        hasRecent: recentConversions > 0
      },
      brokenLinks: {
        ratio404: broken404Ratio,
        isHigh: broken404Ratio > 3
      },
      flags,
      riskScore: flags.length // Simple risk score based on flag count
    })
  } catch (e) {
    console.error('risk assessment error', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
