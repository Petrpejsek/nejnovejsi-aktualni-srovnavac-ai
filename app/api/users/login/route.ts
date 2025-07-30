import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, password } = data
    
    console.log('🔗 USER LOGIN API: Login attempt for:', email)
    
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

    // Find user in database
    console.log('🔗 USER LOGIN API: Searching database for user:', email)
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    console.log('🔗 USER LOGIN API: Database result:', user ? 'USER FOUND' : 'USER NOT FOUND')

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Check if user has hashed password (for Google auth users)
    if (!user.hashedPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please use Google login for this account' 
        },
        { status: 401 }
      )
    }

    // Verify password
    console.log('🔗 USER LOGIN API: Verifying password for:', email)
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword)
    console.log('🔗 USER LOGIN API: Password verification:', isValidPassword ? 'SUCCESS' : 'FAILED')

    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Update last login timestamp
    console.log('🔗 USER LOGIN API: Updating last login timestamp for:', email)
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    console.log('🔗 USER LOGIN API: LOGIN SUCCESSFUL for:', email, 'userID:', user.id)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          premium: user.premium,
          points: user.points,
          level: user.level,
          streak: user.streak
        },
        token: 'mock_jwt_token_' + user.id
      },
      { status: 200 }
    )

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}