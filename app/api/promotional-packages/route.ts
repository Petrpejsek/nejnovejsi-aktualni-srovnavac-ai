import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Mock funkce pro určení statusu uživatele
function getUserStatus(userId?: string): string[] {
  // V reálné aplikaci by se načetl status z databáze
  // Pro teď vrátíme mock statusy pro testování
  const mockUserData = {
    isNew: true, // registrován méně než 7 dní
    hasActiveCampaigns: false,
    balance: 15, // nízký zůstatek
    monthlySpend: 250,
    accountType: 'standard' // standard/trial/enterprise
  }
  
  const statuses = ['all'] // všichni uživatelé vidí balíčky pro "all"
  
  if (mockUserData.isNew) statuses.push('new')
  if (mockUserData.hasActiveCampaigns) statuses.push('active')
  if (mockUserData.balance < 20) statuses.push('low_balance')
  if (mockUserData.monthlySpend > 500) statuses.push('high_spender')
  if (mockUserData.accountType === 'trial') statuses.push('trial')
  if (mockUserData.accountType === 'enterprise') statuses.push('enterprise')
  
  return statuses
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') // Pro budoucí použití
    
    // Mock data s target statusy
    const allPackages = [
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
        targetStatus: 'new',
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
        targetStatus: 'all',
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
        targetStatus: 'active',
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
        targetStatus: 'high_spender',
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
        targetStatus: 'low_balance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    // Získej statusy aktuálního uživatele
    const userStatuses = getUserStatus(userId || undefined)
    
    // Filtruj balíčky podle target statusu
    const filteredPackages = allPackages.filter(pkg => {
      if (!pkg.active) return false // neaktivní balíčky se nezobrazí
      return userStatuses.includes(pkg.targetStatus)
    })
    
    // Seřaď podle pořadí
    const sortedPackages = filteredPackages.sort((a, b) => a.order - b.order)
    
    return NextResponse.json({ 
      packages: sortedPackages,
      userStatuses: userStatuses, // pro debugging
      totalFiltered: sortedPackages.length,
      totalAvailable: allPackages.filter(p => p.active).length
    })
    
  } catch (error) {
    console.error('Error fetching promotional packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promotional packages' }, 
      { status: 500 }
    )
  }
} 