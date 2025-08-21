import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    console.log('admin image upload - session:', session?.user)
    
    // Allow admin users (same logic as original upload-image)
    const isAdmin = session?.user?.role === 'admin' || (session?.user as any)?.isAdmin
    if (!isAdmin) {
      console.log('admin image upload - unauthorized, user role:', session?.user?.role)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productId = params.id
    const formData = await request.formData()
    const file = formData.get('image') as File
    const productName = (formData.get('productName') as string) || 'product'

    if (!file) {
      return NextResponse.json({ success: false, error: 'Soubor není přiložen' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Soubor musí být obrázek' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Soubor je příliš velký (maximum 5MB)' }, { status: 400 })
    }

    const sanitizedProductName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)

    const uploadDir = join(process.cwd(), 'public', 'screenshots')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const webpBuffer = await sharp(buffer, { failOnError: false }).webp({ quality: 85 }).toBuffer()
    const webpName = `${sanitizedProductName}-${Date.now()}.webp`
    const filePath = join(uploadDir, webpName)
    await writeFile(filePath, webpBuffer)

    const imageUrl = `/screenshots/${webpName}`

    const savedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl,
        pendingImageUrl: null,
        imageApprovalStatus: null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, imageUrl, product: savedProduct })
  } catch (error) {
    console.error('❌ Error in admin image upload:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 })
  }
}


