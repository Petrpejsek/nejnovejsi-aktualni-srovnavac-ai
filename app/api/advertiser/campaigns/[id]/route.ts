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

// PATCH /api/advertiser/campaigns/[id] - aktualizace kampaně
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const data = await request.json()

    // Ověřit že kampaň existuje a patří této firmě
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        companyId: user.companyId
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Připravit data pro aktualizaci
    const updateData: any = {}

    // Aktualizace statusu
    if (data.status !== undefined) {
      if (!['active', 'paused'].includes(data.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status. Must be "active" or "paused"' },
          { status: 400 }
        )
      }
      updateData.status = data.status
    }

    // Aktualizace CPC (bidAmount)
    if (data.bidAmount !== undefined) {
      const bidAmount = parseFloat(data.bidAmount)
      if (isNaN(bidAmount) || bidAmount < 0.1) {
        return NextResponse.json(
          { success: false, error: 'Minimum bid amount is $0.10' },
          { status: 400 }
        )
      }
      updateData.bidAmount = bidAmount
    }

    // Aktualizace rozpočtu
    if (data.dailyBudget !== undefined) {
      const dailyBudget = parseFloat(data.dailyBudget)
      if (isNaN(dailyBudget) || dailyBudget < 5) {
        return NextResponse.json(
          { success: false, error: 'Minimum daily budget is $5' },
          { status: 400 }
        )
      }
      updateData.dailyBudget = dailyBudget
    }

    if (data.totalBudget !== undefined) {
      const totalBudget = parseFloat(data.totalBudget)
      if (isNaN(totalBudget) || totalBudget < 0) {
        return NextResponse.json(
          { success: false, error: 'Total budget must be positive' },
          { status: 400 }
        )
      }
      updateData.totalBudget = totalBudget
    }

    // Přidat timestamp aktualizace
    updateData.updatedAt = new Date()

    // Provést aktualizaci
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
      select: {
        id: true,
        name: true,
        status: true,
        bidAmount: true,
        dailyBudget: true,
        totalBudget: true,
        isApproved: true,
        updatedAt: true
      }
    })

    console.log(`📝 Campaign updated: ${campaignId} for company ${user.companyId}`)

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      data: updatedCampaign
    })

  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// GET /api/advertiser/campaigns/[id] - načtení konkrétní kampaně
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Načtení kampaně s detaily
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        companyId: user.companyId
      },
      select: {
        id: true,
        name: true,
        productId: true,
        targetUrl: true,
        bidAmount: true,
        dailyBudget: true,
        totalBudget: true,
        status: true,
        isApproved: true,
        todaySpent: true,
        todayImpressions: true,
        todayClicks: true,
        totalImpressions: true,
        totalClicks: true,
        totalSpent: true,
        createdAt: true,
        updatedAt: true,
        startDate: true,
        endDate: true
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Načtení product info
    const product = await prisma.product.findUnique({
      where: { id: campaign.productId },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    })

    const campaignWithProduct = {
      ...campaign,
      product: product || null,
      ctr: campaign.totalClicks > 0 ? (campaign.totalClicks / campaign.totalImpressions) * 100 : 0
    }

    return NextResponse.json({
      success: true,
      data: campaignWithProduct
    })

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
} 