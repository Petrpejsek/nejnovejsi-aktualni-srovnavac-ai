import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ověření admin tokenu - pro teď dočasně vypneme auth pro testování
function verifyAdminToken(request: NextRequest) {
  // Dočasně vrátíme mock admin pro testování
  return { admin: true, id: 'admin-1' }
  
  /* Původní kód pro později (redigováno, bez fallbacku ve vzorovém kódu):
  const token = request.cookies.get('admin-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
    return decoded
  } catch (error) {
    return null
  }
  */
}

// GET /api/admin/promotional-packages - načtení všech balíčků
export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Načtení skutečných dat z databáze
    const packages = await prisma.promotionalPackage.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      packages: packages
    })

  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

// POST /api/admin/promotional-packages - vytvoření nového balíčku
export async function POST(request: NextRequest) {
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

    // Vytvoření v databázi
    const newPackage = await prisma.promotionalPackage.create({
      data: {
        id: crypto.randomUUID(),
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
        targetStatus: targetStatus || 'all',
        updatedAt: new Date()
      }
    })

    console.log('✅ Created promotional package:', newPackage.title, `(${newPackage.id})`)

    return NextResponse.json({
      success: true,
      package: newPackage,
      message: 'Package created successfully'
    })

  } catch (error) {
    console.error('❌ Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    )
  }
} 