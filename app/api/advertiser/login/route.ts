import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { email, password } = data
    
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
    if (company.status !== 'active') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your account is pending approval. Please wait for admin confirmation.' 
        },
        { status: 403 }
      )
    }

    // Update last login
    await prisma.company.update({
      where: { id: company.id },
      data: { lastLoginAt: new Date() }
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        companyId: company.id, 
        email: company.email,
        name: company.name 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    console.log('🔐 Company logged in:', company.email)

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        balance: company.balance,
        status: company.status
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('advertiser-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
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