import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

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
    const company = await prisma.company.create({
      data: {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        hashedPassword: hashedPassword,
        contactPerson: data.contactPerson,
        website: data.website,
        description: data.description,
        status: 'pending',
        isVerified: false,
        updatedAt: new Date()
      }
    })

    console.log('📝 New advertiser company registered:', company.id)

    return NextResponse.json({
      success: true,
      message: 'Company registered successfully! Your account is pending approval.',
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        status: company.status
      }
    })
  } catch (error) {
    console.error('Error creating company registration:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    console.error('Error details:', errorMessage)
    console.error('Error stack:', errorStack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred during registration',
        details: errorMessage
      },
      { status: 500 }
    )
  }
} 