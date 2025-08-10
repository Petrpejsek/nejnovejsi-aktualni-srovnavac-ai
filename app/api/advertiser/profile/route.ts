import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// GET /api/advertiser/profile - načtení profilu firmy
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    if (!token || token.role !== 'company' || !token.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Map email → companyId and load company profile
    const company = await prisma.company.findFirst({
      where: { email: token.email as string },
      select: {
        id: true,
        name: true,
        email: true,
        contactPerson: true,
        website: true,
        description: true,
        logoUrl: true,
        taxId: true,
        billingAddress: true,
        billingCountry: true,
        status: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: company
    })

  } catch (error) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/advertiser/profile - aktualizace profilu firmy
export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    if (!token || token.role !== 'company' || !token.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { 
      name, 
      contactPerson, 
      website, 
      description, 
      logoUrl, 
      taxId, 
      billingAddress, 
      billingCountry 
    } = data

    // Validace
    if (!name || !contactPerson) {
      return NextResponse.json(
        { success: false, error: 'Company name and contact person are required' },
        { status: 400 }
      )
    }

    // Najdeme firmu podle emailu ze session
    const company = await prisma.company.findFirst({ where: { email: token.email as string }, select: { id: true } })
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    // Aktualizace profilu
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name,
        contactPerson,
        website,
        description,
        logoUrl,
        taxId,
        billingAddress,
        billingCountry,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactPerson: true,
        website: true,
        description: true,
        logoUrl: true,
        taxId: true,
        billingAddress: true,
        billingCountry: true,
        status: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    console.log(`✏️ Company profile updated: ${updatedCompany.name} (${updatedCompany.id})`)

    return NextResponse.json({
      success: true,
      data: updatedCompany,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating company profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 