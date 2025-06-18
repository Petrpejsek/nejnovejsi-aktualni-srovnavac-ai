import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// Ověření JWT tokenu
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('advertiser-token')?.value
  
  console.log('🔐 [Campaigns] Token verification:', { hasToken: !!token, tokenStart: token?.substring(0, 20) })
  
  if (!token) {
    console.log('❌ [Campaigns] No token found')
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    console.log('✅ [Campaigns] Token verified:', { companyId: decoded.companyId })
    return decoded
  } catch (error) {
    console.log('❌ [Campaigns] Token verification failed:', error)
    return null
  }
}

// GET /api/advertiser/campaigns - načtení kampaní firmy
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Načtení kampaní s základními statistikami
    const campaigns = await prisma.campaign.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
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
        startDate: true,
        endDate: true
      }
    })

    // Získat informace o produktech pro kampaně
    const productIds = campaigns.map(c => c.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    })

    // Spojit campaigns s product info
    const campaignsWithProducts = campaigns.map(campaign => {
      const product = products.find(p => p.id === campaign.productId)
      return {
        ...campaign,
        product: product || null,
        ctr: campaign.totalClicks > 0 ? (campaign.totalClicks / campaign.totalImpressions) * 100 : 0
      }
    })

    return NextResponse.json({
      success: true,
      data: campaignsWithProducts
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/advertiser/campaigns - vytvoření nové kampaně
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, productId, targetUrl, bidAmount, dailyBudget, totalBudget } = data

    // Validace
    if (!name || !productId || !targetUrl || !bidAmount || !dailyBudget) {
      return NextResponse.json(
        { success: false, error: 'Please fill all required fields' },
        { status: 400 }
      )
    }

    if (bidAmount < 0.1) {
      return NextResponse.json(
        { success: false, error: 'Minimum bid amount is $0.10' },
        { status: 400 }
      )
    }

    if (dailyBudget < 5) {
      return NextResponse.json(
        { success: false, error: 'Minimum daily budget is $5' },
        { status: 400 }
      )
    }

    // Ověřit že produkt existuje
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Ověřit že firma má dostatečný balance pro alespoň jeden den
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { balance: true }
    })

    if (!company || company.balance < dailyBudget) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance. Please add credits to your account.' },
        { status: 400 }
      )
    }

    // Vytvořit kampaň - HNED AKTIVNÍ BEZ SCHVALOVÁNÍ
    const newCampaign = await prisma.campaign.create({
      data: {
        id: uuidv4(),
        companyId: user.companyId,
        name: data.name,
        productId: data.productId,
        targetUrl: data.targetUrl,
        bidAmount: parseFloat(data.bidAmount),
        dailyBudget: parseFloat(data.dailyBudget),
        totalBudget: parseFloat(data.totalBudget),
        status: 'active',
        isApproved: true,
        startDate: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`🚀 New campaign ACTIVE: ${newCampaign.id} for company ${user.companyId}`)

    return NextResponse.json({
      success: true,
      message: 'Campaign created and activated successfully! Your ads are now live.',
      data: {
        id: newCampaign.id,
        name: newCampaign.name,
        status: newCampaign.status,
        isApproved: newCampaign.isApproved
      }
    })

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
} 