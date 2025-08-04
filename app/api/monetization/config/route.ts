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
    const existingConfig = await prisma.monetization_configs.findUnique({
      where: { ref_code: refCode }
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
    const config = await prisma.monetization_configs.create({
      data: {
        id: crypto.randomUUID(),
        monetizable_type: monetizableType,
        monetizable_id: monetizableId,
        mode,
        ref_code: refCode,
        affiliate_link: affiliateLink,
        fallback_link: fallbackLink,
        is_top: isTop,
        partner_id: partnerId,
        cpc_rate: cpcRate,
        affiliate_rate: affiliateRate,
        created_by: session.user.email,
        updated_at: new Date()
      }
    })

    // Create or update billing account
    await prisma.billing_accounts.upsert({
      where: { partner_id: partnerId },
      create: {
        id: crypto.randomUUID(),
        partner_id: partnerId,
        credit_balance: 0,
        is_active: true,
        updated_at: new Date()
      },
      update: {}
    })

    console.log('✅ Monetization config created:', config.id)

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        monetizableType: config.monetizable_type,
        monetizableId: config.monetizable_id,
        mode: config.mode,
        refCode: config.ref_code,
        isActive: config.is_active,
        createdAt: config.created_at
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
    
    if (partnerId) where.partner_id = partnerId
    if (monetizableType) where.monetizable_type = monetizableType
    if (monetizableId) where.monetizable_id = monetizableId

    const configs = await prisma.monetization_configs.findMany({
      where,
      include: {
        affiliate_clicks: {
          select: { id: true }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json({
      success: true,
      configs: configs.map((config: any) => ({
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