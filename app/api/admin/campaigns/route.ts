import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/campaigns - načtení všech kampaní pro admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // all, pending, active, paused, rejected
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // Build where clause
    let whereClause: any = {}
    if (status && status !== 'all') {
      if (status === 'pending') {
        whereClause.isApproved = false
        whereClause.status = 'active'
      } else {
        whereClause.status = status
      }
    }

    // Načtení kampaní s informacemi o firmě a produktu
    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        Company: true
      }
    })

    // Získat informace o produktech
    const productIds = campaigns.map(c => c.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        category: true
      }
    })

    // Spojit kampaně s product info a spočítat metriky
    const campaignsWithDetails = await Promise.all(
      campaigns.map(async (campaign) => {
        const product = products.find(p => p.id === campaign.productId)
        
        // Získat statistiky kampaně
        const [clicks, impressions] = await Promise.all([
          prisma.adClick.aggregate({
            where: { 
              campaignId: campaign.id,
              isValidClick: true
            },
            _count: { id: true },
            _sum: { costPerClick: true }
          }),
          prisma.adImpression.aggregate({
            where: { campaignId: campaign.id },
            _count: { id: true }
          })
        ])

        const clickCount = clicks._count.id || 0
        const impressionCount = impressions._count.id || 0
        const spend = clicks._sum.costPerClick || 0
        const ctr = impressionCount > 0 ? (clickCount / impressionCount) * 100 : 0

        return {
          ...campaign,
          product: product || null,
          metrics: {
            impressions: impressionCount,
            clicks: clickCount,
            spend: Math.round(spend * 100) / 100,
            ctr: Math.round(ctr * 100) / 100
          },
          companyName: campaign.Company.name
        }
      })
    )

    // Počet celkem pro pagination
    const totalCount = await prisma.campaign.count({ where: whereClause })

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaignsWithDetails,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching admin campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/admin/campaigns - akce na kampaně (approve, reject, pause)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { campaignId, action, reason } = data

    if (!campaignId || !action) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and action are required' },
        { status: 400 }
      )
    }

    // Najít kampaň
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        Company: true
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let logMessage = ''

    switch (action) {
      case 'approve':
        updateData = { 
          isApproved: true, 
          status: 'active',
          startDate: new Date()
        }
        logMessage = `✅ Campaign approved: ${campaign.name} (${campaign.Company.name})`
        break
        
      case 'reject':
        updateData = { 
          isApproved: false, 
          status: 'rejected'
        }
        logMessage = `❌ Campaign rejected: ${campaign.name} (${campaign.Company.name})`
        break
        
      case 'pause':
        updateData = { status: 'paused' }
        logMessage = `⏸️ Campaign paused: ${campaign.name} (${campaign.Company.name})`
        break
        
      case 'resume':
        updateData = { status: 'active' }
        logMessage = `▶️ Campaign resumed: ${campaign.name} (${campaign.Company.name})`
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Aktualizovat kampaň
    await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData
    })

    console.log(logMessage)

    // TODO: Poslat email notifikaci firmě o změně

    return NextResponse.json({
      success: true,
      message: `Campaign ${action}d successfully`,
      data: {
        campaignId,
        action,
        newStatus: updateData.status,
        isApproved: updateData.isApproved,
        companyName: campaign.Company.name
      }
    })

  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
} 