import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/monetization/out/[type]/[id]?ref=xxx
export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  try {
    const [monetizableType, monetizableId] = params.params
    const { searchParams } = new URL(request.url)
    const refCode = searchParams.get('ref')

    console.log('🎯 Monetization redirect:', { monetizableType, monetizableId, refCode })

    if (!monetizableType || !monetizableId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Find monetization config
    let config = null
    
    if (refCode) {
      config = await prisma.monetizationConfig.findUnique({
        where: { refCode }
      })
    } else {
      // Find any active config for this entity
      config = await prisma.monetizationConfig.findFirst({
        where: {
          monetizableType,
          monetizableId,
          isActive: true
        }
      })
    }

    if (!config || !config.isActive) {
      console.log('❌ No active monetization config found')
      return NextResponse.json({ error: 'Not monetized' }, { status: 404 })
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || null
    const referrer = request.headers.get('referer') || null

    // Hash IP for privacy
    const ipHash = await hashIP(ipAddress)

    // Track click based on mode
    const trackingPromises = []

    if (config.mode === 'affiliate' || config.mode === 'hybrid') {
      trackingPromises.push(trackAffiliateClick(config, ipHash, userAgent, referrer))
    }

    if (config.mode === 'cpc' || config.mode === 'hybrid') {
      trackingPromises.push(trackCPCClick(config, ipHash, userAgent, referrer))
    }

    // Execute tracking in parallel
    await Promise.allSettled(trackingPromises)

    // Update config statistics
    await prisma.monetizationConfig.update({
      where: { id: config.id },
      data: {
        totalClicks: { increment: 1 },
        ...(config.mode === 'affiliate' || config.mode === 'hybrid' 
          ? { totalAffiliateClicks: { increment: 1 } } 
          : {}),
        ...(config.mode === 'cpc' || config.mode === 'hybrid' 
          ? { totalCpcClicks: { increment: 1 } } 
          : {})
      }
    })

    // Determine redirect URL
    const redirectUrl = config.affiliateLink || config.fallbackLink || await getOriginalUrl(monetizableType, monetizableId)

    if (!redirectUrl) {
      return NextResponse.json({ error: 'No redirect URL available' }, { status: 404 })
    }

    console.log('✅ Redirecting to:', redirectUrl)

    // Perform redirect
    return NextResponse.redirect(redirectUrl, { status: 302 })

  } catch (error) {
    console.error('💥 Monetization redirect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + 'monetization_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}

async function trackAffiliateClick(
  config: any, 
  ipHash: string, 
  userAgent: string | null, 
  referrer: string | null
) {
  try {
    await prisma.affiliateClick.create({
      data: {
        monetizableType: config.monetizableType,
        monetizableId: config.monetizableId,
        refCode: config.refCode,
        partnerId: config.partnerId,
        ipHash,
        userAgent,
        referrer,
        clickSource: 'direct'
      }
    })
    console.log('📊 Affiliate click tracked')
  } catch (error) {
    console.error('❌ Affiliate tracking failed:', error)
  }
}

async function trackCPCClick(
  config: any, 
  ipHash: string, 
  userAgent: string | null, 
  referrer: string | null
) {
  try {
    if (!config.cpcRate || config.cpcRate <= 0) {
      console.log('⚠️ Invalid CPC rate, skipping CPC tracking')
      return
    }

    // Check partner balance
    const billingAccount = await prisma.billingAccount.findUnique({
      where: { partnerId: config.partnerId }
    })

    if (!billingAccount || billingAccount.creditBalance < config.cpcRate) {
      console.log('💸 Insufficient balance for CPC tracking')
      return
    }

    // Charge the click
    await prisma.$transaction(async (tx) => {
      // Create click record
      await tx.adClickMonetization.create({
        data: {
          monetizableType: config.monetizableType,
          monetizableId: config.monetizableId,
          partnerId: config.partnerId,
          ipHash,
          userAgent,
          referrer,
          costPerClick: config.cpcRate,
          currency: 'USD'
        }
      })

      // Deduct balance
      await tx.billingAccount.update({
        where: { partnerId: config.partnerId },
        data: {
          creditBalance: { decrement: config.cpcRate },
          totalSpent: { increment: config.cpcRate },
          lastActivityAt: new Date()
        }
      })
    })

    console.log(`💰 CPC click tracked: $${config.cpcRate}`)
  } catch (error) {
    console.error('❌ CPC tracking failed:', error)
  }
}

async function getOriginalUrl(monetizableType: string, monetizableId: string): Promise<string | null> {
  try {
    if (monetizableType === 'Product' || monetizableType === 'Tool') {
      const product = await prisma.product.findUnique({
        where: { id: monetizableId },
        select: { externalUrl: true }
      })
      return product?.externalUrl || null
    }
    return null
  } catch (error) {
    console.error('❌ Failed to get original URL:', error)
    return null
  }
}