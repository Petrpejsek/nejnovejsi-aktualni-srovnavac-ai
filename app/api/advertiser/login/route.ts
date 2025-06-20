import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { email, password, rememberMe = false } = data
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      )
    }

    // Find company
    const company = await prisma.company.findUnique({
      where: { email }
    })

    if (!company) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, company.hashedPassword)

    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Check if company is approved
    if (company.status !== 'active' && company.status !== 'approved') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your account is pending approval. Please wait for admin confirmation.' 
        },
        { status: 403 }
      )
    }

    // Update last login and change status from 'approved' to 'active' on first login
    const updateData: any = { lastLoginAt: new Date() }
    if (company.status === 'approved') {
      updateData.status = 'active'
      console.log(`🎯 First login: Changing company ${company.name} status from 'approved' to 'active'`)
    }

    await prisma.company.update({
      where: { id: company.id },
      data: updateData
    })

    // Nastavení doby platnosti podle remember me
    const tokenExpiry = rememberMe ? '30d' : '7d' // 30 dní pokud je remember me zapnuté, jinak 7 dní
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7 // v sekundách

    // Create JWT token
    const token = jwt.sign(
      { 
        companyId: company.id, 
        email: company.email,
        name: company.name 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: tokenExpiry }
    )

    console.log(`🔐 Company logged in: ${company.email} ${rememberMe ? '(Remember Me enabled - 30 days)' : '(Standard login - 7 days)'}`)

    // Create response with secure cookie (use updated status)
    const finalStatus = company.status === 'approved' ? 'active' : company.status
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        balance: company.balance,
        status: finalStatus,
        rememberMe: rememberMe // Informace pro frontend
      }
    })

    // Set HTTP-only cookie s odpovídající dobou platnosti
    response.cookies.set('advertiser-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge
    })

    return response

  } catch (error) {
    console.error('Error during company login:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred during login' 
      },
      { status: 500 }
    )
  }
} 