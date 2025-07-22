import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { unlink } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// DELETE /api/reels/[id] - Delete reel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get reel to find video file path
    const reel = await prisma.reel.findUnique({
      where: { id }
    })

    if (!reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 })
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'public', reel.videoUrl)
      await unlink(filePath)
    } catch (fileError) {
      console.warn('File deletion warning:', fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.reel.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Reel deleted successfully' })
  } catch (error) {
    console.error('Error deleting reel:', error)
    return NextResponse.json({ error: 'Failed to delete reel' }, { status: 500 })
  }
}

// PUT /api/reels/[id] - Update reel (optional for future)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const reel = await prisma.reel.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(reel)
  } catch (error) {
    console.error('Error updating reel:', error)
    return NextResponse.json({ error: 'Failed to update reel' }, { status: 500 })
  }
} 