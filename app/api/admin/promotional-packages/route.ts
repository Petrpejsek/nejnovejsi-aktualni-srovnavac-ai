import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ověření admin tokenu - pro teď dočasně vypneme auth pro testování
function verifyAdminToken(request: NextRequest) {
  // Dočasně vrátíme mock admin pro testování
  return { admin: true, id: 'admin-1' }
  
  /* Původní kód pro později:
  const token = request.cookies.get('admin-token')?.value
  
  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
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

    // Pro teď vrátíme mock data, později připojíme k databázi
    const mockPackages = [
      {
        id: '1',
        title: 'Welcome Bonus',
        description: 'Perfect to get started! Double your first deposit.',
        amount: 100,
        bonus: 100,
        savings: 100,
        firstTime: true,
        active: true,
        order: 1,
        targetStatus: 'new', // Pouze pro nové uživatele
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Growth Package',
        description: 'Scale your campaigns with extra budget.',
        amount: 500,
        bonus: 100,
        savings: 100,
        active: true,
        order: 2,
        targetStatus: 'all', // Pro všechny
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Premium Package',
        description: 'Maximum impact for serious advertisers.',
        amount: 1000,
        bonus: 200,
        savings: 200,
        popular: true,
        active: true,
        order: 3,
        targetStatus: 'active', // Pro aktivní uživatele
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Enterprise Package',
        description: 'For high-volume campaigns and maximum reach.',
        amount: 2500,
        bonus: 750,
        savings: 750,
        active: true,
        order: 4,
        targetStatus: 'high_spender', // Pro uživatele s vysokými výdaji
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Low Balance Boost',
        description: 'Quick top-up for users running low on funds.',
        amount: 50,
        bonus: 25,
        savings: 25,
        active: true,
        order: 5,
        targetStatus: 'low_balance', // Pro uživatele s nízkým zůstatkem
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      packages: mockPackages
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

    // Pro teď jen simulujeme vytvoření
    const newPackage = {
      id: Date.now().toString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      package: newPackage,
      message: 'Package created successfully'
    })

  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create package' },
      { status: 500 }
    )
  }
} 