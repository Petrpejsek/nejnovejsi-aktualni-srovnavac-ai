import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// GET /api/reels - Get all reels
export async function GET() {
  try {
    const reels = await prisma.reel.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
        adText: true,
        adLink: true,
        adEnabled: true
      }
    })

    return NextResponse.json(reels)
  } catch (error) {
    console.error('Error fetching reels:', error)
    return NextResponse.json({ error: 'Failed to fetch reels' }, { status: 500 })
  }
}

// POST /api/reels - Create new reel
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const videoFile = formData.get('video') as File
    const thumbnailFile = formData.get('thumbnail') as File

    // Validation
    if (!title || !videoFile) {
      return NextResponse.json({ error: 'Title and video are required' }, { status: 400 })
    }

    // Validate video file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 })
    }

    // Validate video file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (videoFile.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    // Validate thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      if (!thumbnailFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Thumbnail must be an image' }, { status: 400 })
      }
      
      const maxThumbSize = 5 * 1024 * 1024 // 5MB
      if (thumbnailFile.size > maxThumbSize) {
        return NextResponse.json({ error: 'Thumbnail size must be less than 5MB' }, { status: 400 })
      }
    }

    // Create unique filename for video
    const timestamp = Date.now()
    const videoExtension = path.extname(videoFile.name)
    const videoFileName = `reel_${timestamp}${videoExtension}`
    
    // Ensure uploads directories exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reels')
    const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
    try {
      await mkdir(uploadsDir, { recursive: true })
      await mkdir(thumbnailsDir, { recursive: true })
    } catch (error) {
      // Directories might already exist
    }

    // Save video file to public/uploads/reels/
    const videoFilePath = path.join(uploadsDir, videoFileName)
    const videoBytes = await videoFile.arrayBuffer()
    const videoBuffer = Buffer.from(videoBytes)
    await writeFile(videoFilePath, videoBuffer)
    
    let thumbnailUrl = null
    
    // Handle thumbnail upload if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbnailExtension = path.extname(thumbnailFile.name)
      const thumbnailFileName = `thumb_${timestamp}${thumbnailExtension}`
      const thumbnailFilePath = path.join(thumbnailsDir, thumbnailFileName)
      
      // Save thumbnail file
      const thumbnailBytes = await thumbnailFile.arrayBuffer()
      const thumbnailBuffer = Buffer.from(thumbnailBytes)
      await writeFile(thumbnailFilePath, thumbnailBuffer)
      
      thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`
    }
    
    // Save to database
    const videoUrl = `/uploads/reels/${videoFileName}`
    const newReel = await prisma.reel.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        videoUrl,
        thumbnailUrl
      }
    })

    return NextResponse.json(newReel, { status: 201 })
  } catch (error) {
    console.error('Error creating reel:', error)
    return NextResponse.json({ error: 'Failed to create reel' }, { status: 500 })
  }
} 