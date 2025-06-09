import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, password } = data
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please fill all required fields' 
        },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid email address' 
        },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A user with this email already exists' 
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate name from email (everything before @)
    const generatedName = email.split('@')[0]
    
    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        name: generatedName,
        email,
        hashedPassword,
        points: 0,
        level: 'Beginner',
        streak: 0,
        toolsUsed: 0,
        premium: false,
        isActive: true
      }
    })

    console.log('🎉 User registered successfully:', newUser.email)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
} 