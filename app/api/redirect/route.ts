import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const externalUrl = searchParams.get('externalUrl')

    console.log('🔧 DEBUG: Redirect called with:', { productId, externalUrl })

    if (!productId || !externalUrl) {
      return NextResponse.json({ error: 'Product ID and external URL are required' }, { status: 400 })
    }

    // Check if URL is valid
    try {
      new URL(externalUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    console.log('🔧 DEBUG: Session:', session?.user?.email || 'not logged in')
    
    // If user is logged in, record click history
    if (session?.user?.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })

        console.log('🔧 DEBUG: User found:', user?.id || 'not found')

        if (user) {
          // Get product details for better tracking
          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
              name: true,
              category: true,
              imageUrl: true,
              price: true
            }
          })
          
          console.log('🔧 DEBUG: Product found:', product?.name || 'not found')
          
          // Record click in history (even if product not found)
          const clickRecord = await prisma.clickHistory.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              productId,
              productName: product?.name || productId,
              category: product?.category || null,
              imageUrl: product?.imageUrl || null,
              price: product?.price || null,
              externalUrl
            }
          })

          console.log(`🔗 DEBUG: Click tracked successfully! ID: ${clickRecord.id}`)
        }
      } catch (trackingError) {
        console.error('🔧 DEBUG: Error tracking click:', trackingError)
        // Continue with redirect even if tracking fails
      }
    } else {
      console.log('🔧 DEBUG: User not logged in, skipping tracking')
    }

    // Perform server-side redirect
    return NextResponse.redirect(externalUrl)

  } catch (error) {
    console.error('🔧 DEBUG: Error in redirect API:', error)
    return NextResponse.redirect('/error')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, externalUrl } = await request.json()

    if (!productId || !externalUrl) {
      return NextResponse.json({ error: 'Product ID and external URL are required' }, { status: 400 })
    }

    // Check if URL is valid
    try {
      new URL(externalUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    
    // If user is logged in, record click history
    if (session?.user?.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })

        if (user) {
          // Get product details for better tracking
          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
              name: true,
              category: true,
              imageUrl: true,
              price: true
            }
          })

          // Record click in history (even if product not found)
          await prisma.clickHistory.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              productId,
              productName: product?.name || productId,
              category: product?.category || null,
              imageUrl: product?.imageUrl || null,
              price: product?.price || null,
              externalUrl
            }
          })

          console.log(`🔗 Click tracked for user: ${session.user.email}, productId: ${productId}`)
        }
      } catch (trackingError) {
        console.error('Error tracking click:', trackingError)
        // Continue with redirect even if tracking fails
      }
    }

    // Return the external URL for frontend to redirect
    return NextResponse.json({ 
      success: true, 
      redirectUrl: externalUrl,
      message: 'Click tracked successfully'
    })

  } catch (error) {
    console.error('Error in redirect API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 