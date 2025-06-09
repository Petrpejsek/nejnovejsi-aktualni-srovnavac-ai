import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to fix Vercel build error with headers()
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('avatar') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 2MB for Base64)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2MB' }, { status: 400 })
    }

    try {
      // Convert file to Base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

      // Save Base64 string to database
      await prisma.user.update({
        where: { email: session.user.email },
        data: { avatar: base64String }
      })
      
      console.log(`✅ Avatar saved to database (Base64) for user: ${session.user.email}`)

      return NextResponse.json({ 
        success: true, 
        avatarUrl: base64String,
        message: 'Avatar uploaded successfully' 
      })

    } catch (dbError) {
      console.error('❌ Error saving avatar to database:', dbError)
      return NextResponse.json({ error: 'Failed to save avatar' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete avatar URL from database
    await prisma.user.update({
      where: { email: session.user.email },
      data: { avatar: null }
    })

    console.log(`✅ Avatar removed from database for user: ${session.user.email}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Avatar removed successfully' 
    })

  } catch (error) {
    console.error('Error removing avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 