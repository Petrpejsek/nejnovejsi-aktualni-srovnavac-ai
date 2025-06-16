import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Funkce pro určení statusu uživatele (zatím mock logika)
function getUserStatus(userId?: string): string[] {
  // Mock logika - v budoucnu můžeme implementovat skutečné určování statusu
  // Na základě dat uživatele, zůstatku, aktivity atd.
  
  if (!userId) {
    // Pro nepřihlášené uživatele ukážeme obecné balíčky
    return ['all', 'new']
  }
  
  // Mock implementace - můžeme rozšířit podle potřeby
  return [
    'all',
    'new',      // všichni jsou "noví" pro účely testování
    'active',   // a "aktivní"
    // 'low_balance',
    // 'high_spender',
    // 'trial',
    // 'enterprise'
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') // Pro budoucí použití
    
    // Načtení všech aktivních balíčků z databáze
    const allPackages = await prisma.promotionalPackage.findMany({
      where: {
        active: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    // Získej statusy aktuálního uživatele
    const userStatuses = getUserStatus(userId || undefined)
    
    // Filtruj balíčky podle target statusu
    const filteredPackages = allPackages.filter(pkg => {
      return userStatuses.includes(pkg.targetStatus)
    })
    
    return NextResponse.json({ 
      packages: filteredPackages,
      userStatuses: userStatuses, // pro debugging
      totalFiltered: filteredPackages.length,
      totalAvailable: allPackages.length
    })
    
  } catch (error) {
    console.error('Error fetching promotional packages:', error)
    
    // Fallback na mock data při chybě databáze
    const fallbackPackages = [
      {
        id: 'fallback-1',
        title: 'Welcome Bonus',
        description: 'Perfect to get started! Double your first deposit.',
        amount: 100,
        bonus: 100,
        savings: 100,
        firstTime: true,
        active: true,
        order: 1,
        targetStatus: 'new',
        popular: false,
        minimumSpend: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(
      { 
        packages: fallbackPackages,
        error: 'Database connection failed, showing fallback data',
        userStatuses: ['all', 'new'],
        totalFiltered: 1,
        totalAvailable: 1
      }
    )
  }
} 