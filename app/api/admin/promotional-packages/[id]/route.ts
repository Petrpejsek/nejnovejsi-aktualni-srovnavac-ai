import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ověření admin tokenu - pro teď dočasně vypneme auth pro testování
function verifyAdminToken(request: NextRequest) {
  // Dočasně vrátíme mock admin pro testování
  return { admin: true, id: 'admin-1' }
}

// PUT /api/admin/promotional-packages/[id] - úprava balíčku
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { title, description, amount, bonus, popular, firstTime, minimumSpend, active, order, targetStatus } = data

    // Validace
    if (!title || !description || amount <= 0 || bonus < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided' },
        { status: 400 }
      )
    }

    // Pro teď jen simulujeme úpravu
    const updatedPackage = {
      id: params.id,
      title,
      description,
      amount,
      bonus,
      savings: bonus,
      popular: popular || false,
      firstTime: firstTime || false,
      minimumSpend: minimumSpend || 0,
      active: active !== false,
      order: order || 1,
      targetStatus: targetStatus || 'all',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Mock old date
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      package: updatedPackage,
      message: 'Package updated successfully'
    })

  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/promotional-packages/[id] - smazání balíčku
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Pro teď jen simulujeme smazání
    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete package' },
      { status: 500 }
    )
  }
} 