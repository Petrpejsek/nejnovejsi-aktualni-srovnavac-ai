import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/monetization/conversion - Webhook conversion tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      ref_code, 
      conversion_type, 
      conversion_value, 
      currency = 'USD',
      external_conversion_id,
      session_id,
      metadata 
    } = body

    console.log('🎯 Conversion webhook received:', { ref_code, conversion_type, conversion_value })

    if (!ref_code || !conversion_type) {
      return NextResponse.json({ error: 'ref_code and conversion_type are required' }, { status: 400 })
    }

    // Find the monetization config
    const config = await prisma.monetization_configs.findUnique({
      where: { ref_code: ref_code }
    })

    if (!config) {
      return NextResponse.json({ error: 'Invalid ref_code' }, { status: 404 })
    }

    // Find the most recent affiliate click
    const affiliateClick = await prisma.affiliate_clicks.findFirst({
      where: { ref_code: ref_code },
      orderBy: { timestamp: 'desc' }
    })

    if (!affiliateClick) {
      return NextResponse.json({ error: 'No matching affiliate click found' }, { status: 404 })
    }

    // Check attribution window (30 days)
    const attributionWindowHours = 720 // 30 days
    const cutoffTime = new Date(Date.now() - attributionWindowHours * 60 * 60 * 1000)
    
    if (affiliateClick.timestamp < cutoffTime) {
      return NextResponse.json({ error: 'Click outside attribution window' }, { status: 400 })
    }

    // Calculate commission
    let commissionAmount = null
    if (config.affiliate_rate && conversion_value) {
      commissionAmount = (conversion_value * config.affiliate_rate) / 100
    }

    // Create conversion record
    const conversion = await prisma.affiliate_conversions.create({
      data: {
        id: crypto.randomUUID(),
        affiliate_click_id: affiliateClick.id,
        ref_code: ref_code,
        partner_id: config.partner_id,
        monetizable_type: config.monetizable_type,
        monetizable_id: config.monetizable_id,
        conversion_type: conversion_type,
        conversion_value: conversion_value,
        currency,
        commission_rate: config.affiliate_rate,
        commission_amount: commissionAmount,
        attribution_window_hours: attributionWindowHours,
        session_id: session_id,
        external_conversion_id: external_conversion_id,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    // Update affiliate click
    await prisma.affiliate_clicks.update({
      where: { id: affiliateClick.id },
      data: {
        is_converted: true,
        conversion_id: conversion.id
      }
    })

    // Update config statistics
    await prisma.monetization_configs.update({
      where: { id: config.id },
      data: {
        total_conversions: { increment: 1 },
        total_revenue: commissionAmount ? { increment: commissionAmount } : undefined
      }
    })

    console.log('✅ Conversion tracked:', conversion.id)

    return NextResponse.json({
      success: true,
      conversion_id: conversion.id,
      commission_amount: commissionAmount,
      message: 'Conversion tracked successfully'
    })

  } catch (error) {
    console.error('💥 Conversion tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/monetization/conversion.gif - Pixel conversion tracking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ref = searchParams.get('ref')
    const type = searchParams.get('type')
    const value = searchParams.get('value')
    const currency = searchParams.get('currency') || 'USD'
    const external_id = searchParams.get('external_id')
    const session = searchParams.get('session')

    // Track conversion asynchronously
    if (ref && type) {
      trackConversionAsync(ref, type, value ? parseFloat(value) : null, currency, external_id, session)
        .catch(error => console.error('Pixel conversion tracking failed:', error))
    }

    // Return 1x1 transparent GIF
    const gifBuffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new NextResponse(gifBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': gifBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('💥 Pixel tracking error:', error)
    
    // Always return GIF even on error
    const gifBuffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new NextResponse(gifBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache'
      }
    })
  }
}

async function trackConversionAsync(
  ref_code: string,
  conversion_type: string,
  conversion_value: number | null,
  currency: string,
  external_conversion_id: string | null,
  session_id: string | null
) {
  try {
    // Use the same logic as POST webhook
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/monetization/conversion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref_code,
        conversion_type,
        conversion_value,
        currency,
        external_conversion_id,
        session_id
      })
    })

    if (response.ok) {
      console.log('✅ Pixel conversion tracked:', ref_code)
    } else {
      console.log('⚠️ Pixel conversion failed:', await response.text())
    }
  } catch (error) {
    console.error('❌ Async conversion tracking failed:', error)
  }
}