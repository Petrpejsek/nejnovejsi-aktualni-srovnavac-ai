import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { name, email, password, contactPerson, website, description } = data
    
    // Validation
    if (!name || !email || !password || !contactPerson) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please fill all required fields (company name, contact person, email, password)' 
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

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email }
    })

    if (existingCompany) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A company with this email already exists' 
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new company
    const newCompany = await prisma.company.create({
      data: {
        name,
        email,
        hashedPassword,
        contactPerson,
        website: website || null,
        description: description || null,
        status: 'pending', // Requires admin approval
        isVerified: false
      }
    })

    console.log('📝 New advertiser company registered:', newCompany.id)

    return NextResponse.json({
      success: true,
      message: 'Company registered successfully! Your account is pending approval.',
      data: {
        id: newCompany.id,
        name: newCompany.name,
        email: newCompany.email,
        status: newCompany.status
      }
    })
  } catch (error) {
    console.error('Error creating company registration:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred during registration' 
      },
      { status: 500 }
    )
  }
} 