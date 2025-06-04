import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Získáme skutečné počty z databáze paralelně - pouze z existujících tabulek
    const [
      totalProducts,
      totalClicks,
      uniqueVisitors
    ] = await Promise.all([
      prisma.product.count(),
      prisma.click.count(),
      prisma.click.groupBy({
        by: ['visitorId'],
        _count: true
      }).then(visitors => visitors.length)
    ])

    // Vytvoříme statistiky pouze s daty, která máme
    const stats = {
      products: {
        total: totalProducts,
        active: totalProducts, // Pro nyní považujeme všechny produkty za aktivní
        pending: 0,
        draft: 0
      },
      courses: {
        total: 9, // Statické data - kurzy zatím nejsou v databázi
        published: 5,
        draft: 4,
        enrolled: 2341
      },
      companies: {
        total: 8, // Statické data - firmy zatím nejsou v databázi
        active: 8,
        pending: 0,
        verified: 8
      },
      pages: {
        total: 12, // Statické data - stránky zatím nejsou v databázi
        published: 10,
        draft: 2
      },
      users: {
        total: 156, // Statické data - uživatelé zatím nejsou v databázi
        active: 134,
        companies: 8
      },
      analytics: {
        totalClicks,
        uniqueVisitors
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání statistik' },
      { status: 500 }
    )
  }
} 