import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ověření admin tokenu - pro teď dočasně vypneme auth pro testování
function verifyAdminToken(request: NextRequest) {
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

    // Úprava v databázi
    const updatedPackage = await prisma.promotionalPackage.update({
      where: { id: params.id },
      data: {
        title,
        description,
        amount,
        bonus,
        savings: bonus, // Auto-calculate savings as bonus amount
        popular: popular || false,
        firstTime: firstTime || false,
        minimumSpend: minimumSpend || 0,
        active: active !== false,
        order: order || 1,
        targetStatus: targetStatus || 'all'
      }
    })

    console.log('✅ Updated promotional package:', updatedPackage.title, `(${updatedPackage.id})`)

    return NextResponse.json({
      success: true,
      package: updatedPackage,
      message: 'Package updated successfully'
    })

  } catch (error) {
    console.error('❌ Error updating package:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }
    
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

    // Smazání z databáze
    const deletedPackage = await prisma.promotionalPackage.delete({
      where: { id: params.id }
    })

    console.log('✅ Deleted promotional package:', deletedPackage.title, `(${deletedPackage.id})`)

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting package:', error)
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete package' },
      { status: 500 }
    )
  }
} 