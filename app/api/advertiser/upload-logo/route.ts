import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('advertiser-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    let companyId: string
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { companyId: string }
      companyId = decoded.companyId
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${companyId}-${Date.now()}.${fileExtension}`
    const filePath = join(uploadDir, uniqueFilename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return public URL
    const logoUrl = `/uploads/logos/${uniqueFilename}`

    return NextResponse.json({
      success: true,
      logoUrl,
      message: 'Logo uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload logo' 
    }, { status: 500 })
  }
} 