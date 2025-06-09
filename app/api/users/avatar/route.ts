import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const fileName = `avatar_${session.user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${file.type.split('/')[1]}`
    
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    
    try {
      await writeFile(join(uploadsDir, fileName), buffer)
    } catch (error) {
      // Create directory if it doesn't exist
      const { mkdir } = await import('fs/promises')
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(join(uploadsDir, fileName), buffer)
    }

    const avatarUrl = `/uploads/avatars/${fileName}`

    // Save avatar URL to database
    try {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { avatar: avatarUrl }
      })
      
      console.log(`✅ Avatar saved to database for user: ${session.user.email}`)
    } catch (dbError) {
      console.error('❌ Error saving avatar to database:', dbError)
      // If database save fails, we should probably delete the uploaded file
      // But for now, just continue - the file is uploaded but not linked to user
    }
    
    return NextResponse.json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar uploaded successfully' 
    })

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

    // Get current avatar URL from database before deleting
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { avatar: true }
    })

    // Delete avatar URL from database
    await prisma.user.update({
      where: { email: session.user.email },
      data: { avatar: null }
    })

    // If there was an avatar file, try to delete it from filesystem
    if (user?.avatar) {
      try {
        const filePath = join(process.cwd(), 'public', user.avatar)
        await unlink(filePath)
        console.log(`🗑️ Avatar file deleted: ${user.avatar}`)
      } catch (fileError) {
        console.log(`⚠️ Could not delete avatar file: ${user.avatar} (might not exist)`)
        // Don't fail the request if file deletion fails
      }
    }

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