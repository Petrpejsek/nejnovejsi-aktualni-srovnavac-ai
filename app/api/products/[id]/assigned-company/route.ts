import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

// GET /api/products/[id]/assigned-company - Get company assigned to this product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    
    // Najít firmu která má přiřazený tento produkt
    const assignedCompany = await prisma.company.findFirst({
      where: {
        assignedProductId: productId,
        status: {
          in: ['approved', 'active'] // Jen schválené firmy
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactPerson: true,
        website: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    return NextResponse.json({
      success: true,
      assignedCompany: assignedCompany || null
    })
    
  } catch (error) {
    console.error('Error fetching assigned company:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assigned company' }, 
      { status: 500 }
    )
  }
} 