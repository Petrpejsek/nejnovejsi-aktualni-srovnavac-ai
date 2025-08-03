import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/monetization/config - Create monetization configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      monetizableType,
      monetizableId,
      mode = 'cpc',
      refCode,
      affiliateLink,
      fallbackLink,
      isTop = false,
      partnerId,
      cpcRate,
      affiliateRate
    } = body

    console.log('🎯 Creating monetization config:', { monetizableType, monetizableId, mode, refCode })

    // Validate required fields
    if (!monetizableType || !monetizableId || !refCode || !partnerId) {
      return NextResponse.json({ 
        error: 'monetizableType, monetizableId, refCode, and partnerId are required' 
      }, { status: 400 })
    }

    // Check if ref_code is unique
    const existingConfig = await prisma.monetizationConfig.findUnique({
      where: { refCode }
    })

    if (existingConfig) {
      return NextResponse.json({ error: 'ref_code already exists' }, { status: 400 })
    }

    // Validate mode-specific requirements
    if (mode === 'cpc' && !cpcRate) {
      return NextResponse.json({ error: 'cpcRate is required for CPC mode' }, { status: 400 })
    }

    if ((mode === 'affiliate' || mode === 'hybrid') && (!affiliateLink || !affiliateRate)) {
      return NextResponse.json({ 
        error: 'affiliateLink and affiliateRate are required for affiliate and hybrid modes' 
      }, { status: 400 })
    }

    // Create monetization config
    const config = await prisma.monetizationConfig.create({
      data: {
        monetizableType,
        monetizableId,
        mode,
        refCode,
        affiliateLink,
        fallbackLink,
        isTop,
        partnerId,
        cpcRate,
        affiliateRate,
        createdBy: session.user.email
      }
    })

    // Create or update billing account
    await prisma.billingAccount.upsert({
      where: { partnerId },
      create: {
        partnerId,
        creditBalance: 0,
        isActive: true
      },
      update: {}
    })

    console.log('✅ Monetization config created:', config.id)

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        monetizableType: config.monetizableType,
        monetizableId: config.monetizableId,
        mode: config.mode,
        refCode: config.refCode,
        isActive: config.isActive,
        createdAt: config.createdAt
      }
    })

  } catch (error) {
    console.error('💥 Config creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/monetization/config - List configurations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')
    const monetizableType = searchParams.get('monetizableType')
    const monetizableId = searchParams.get('monetizableId')

    const where: any = {}
    
    if (partnerId) where.partnerId = partnerId
    if (monetizableType) where.monetizableType = monetizableType
    if (monetizableId) where.monetizableId = monetizableId

    const configs = await prisma.monetizationConfig.findMany({
      where,
      include: {
        affiliateClicks: {
          select: { id: true }
        },
        conversions: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      configs: configs.map(config => ({
        ...config,
        affiliateClicksCount: config.affiliateClicks.length,
        conversionsCount: config.conversions.length
      }))
    })

  } catch (error) {
    console.error('💥 Config listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}