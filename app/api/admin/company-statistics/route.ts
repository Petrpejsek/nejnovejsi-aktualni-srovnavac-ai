import { NextRequest, NextResponse } from 'next/server'

// Mock data pro demonstraci - v produkci by se načítalo z databáze
const generateMockStatistics = (timeframe: string) => {
  const baseCompanies = 127
  const baseBalance = 45670.50
  
  return {
    overview: {
      totalCompanies: baseCompanies,
      companiesWithBalance: Math.floor(baseCompanies * 0.73), // 73% má kredit
      activeCompanies: Math.floor(baseCompanies * 0.45), // 45% aktivních
      recentCompanies: Math.floor(baseCompanies * 0.12), // 12% nových za 30 dní
      totalBalance: baseBalance,
      avgBalance: baseBalance / baseCompanies
    },
    balanceDistribution: [
      { range: 'No Balance', count: Math.floor(baseCompanies * 0.27) },
      { range: '$1-50', count: Math.floor(baseCompanies * 0.23) },
      { range: '$51-100', count: Math.floor(baseCompanies * 0.18) },
      { range: '$101-500', count: Math.floor(baseCompanies * 0.22) },
      { range: '$501-1000', count: Math.floor(baseCompanies * 0.07) },
      { range: '$1000+', count: Math.floor(baseCompanies * 0.03) }
    ],
    topSpendingCompanies: [
      { id: '1', name: 'TechCorp Solutions', email: 'billing@techcorp.com', balance: 2150.75, autoRecharge: true, autoRechargeThreshold: 100, autoRechargeAmount: 500, createdAt: '2024-01-15T10:00:00Z' },
      { id: '2', name: 'Digital Marketing Pro', email: 'admin@digitalmarketing.com', balance: 1890.25, autoRecharge: true, autoRechargeThreshold: 200, autoRechargeAmount: 1000, createdAt: '2024-02-20T14:30:00Z' },
      { id: '3', name: 'StartupX Inc', email: 'finance@startupx.io', balance: 1650.00, autoRecharge: false, autoRechargeThreshold: null, autoRechargeAmount: null, createdAt: '2024-03-10T09:15:00Z' },
      { id: '4', name: 'E-commerce Giants', email: 'billing@ecommerce.com', balance: 1420.50, autoRecharge: true, autoRechargeThreshold: 150, autoRechargeAmount: 750, createdAt: '2024-01-28T16:45:00Z' },
      { id: '5', name: 'AI Research Lab', email: 'accounts@ailab.org', balance: 1290.75, autoRecharge: true, autoRechargeThreshold: 300, autoRechargeAmount: 1500, createdAt: '2024-04-05T11:20:00Z' }
    ],
    autoPaymentStats: {
      enabled: Math.floor(baseCompanies * 0.58), // 58% má auto-payment
      disabled: Math.floor(baseCompanies * 0.42), // 42% nemá
      avgThreshold: 165.50,
      avgAmount: 823.25
    },
    dailyLimitStats: {
      companiesWithLimits: Math.floor(baseCompanies * 0.34), // 34% má denní limity
      avgDailyLimit: 185.75,
      totalDailyLimitCapacity: Math.floor(baseCompanies * 0.34) * 185.75
    },
    latestCompanies: [
      { id: '123', name: 'Fresh Digital Agency', email: 'hello@freshdigital.com', balance: 50.00, autoRecharge: false, createdAt: '2024-06-07T08:30:00Z' },
      { id: '124', name: 'Modern Solutions Ltd', email: 'billing@modern.co.uk', balance: 200.00, autoRecharge: true, createdAt: '2024-06-06T14:22:00Z' },
      { id: '125', name: 'Creative Studio Plus', email: 'accounts@creative.studio', balance: 0.00, autoRecharge: false, createdAt: '2024-06-05T16:15:00Z' },
      { id: '126', name: 'Global Tech Ventures', email: 'finance@globaltech.com', balance: 1000.00, autoRecharge: true, createdAt: '2024-06-04T10:45:00Z' },
      { id: '127', name: 'Innovation Hub Co', email: 'billing@innovationhub.io', balance: 75.50, autoRecharge: false, createdAt: '2024-06-03T13:10:00Z' }
    ],
    spendingTrends: {
      daily: timeframe === 'day' ? [
        { date: '2024-06-01', amount: 1250.75 },
        { date: '2024-06-02', amount: 1890.25 },
        { date: '2024-06-03', amount: 2100.50 },
        { date: '2024-06-04', amount: 1675.80 },
        { date: '2024-06-05', amount: 2250.00 },
        { date: '2024-06-06', amount: 1950.25 },
        { date: '2024-06-07', amount: 2780.75 }
      ] : [],
      weekly: timeframe === 'week' ? [
        { period: 'W22', amount: 12500.75 },
        { period: 'W23', amount: 15890.25 },
        { period: 'W24', amount: 18900.50 },
        { period: 'W25', amount: 16750.80 }
      ] : [],
      monthly: timeframe === 'month' ? [
        { period: 'Jan', amount: 45250.75 },
        { period: 'Feb', amount: 52890.25 },
        { period: 'Mar', amount: 48900.50 },
        { period: 'Apr', amount: 56750.80 },
        { period: 'May', amount: 62100.25 },
        { period: 'Jun', amount: 35420.75 }
      ] : []
    },
    timeframe,
    generatedAt: new Date().toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'

    const statistics = generateMockStatistics(timeframe)

    return NextResponse.json({
      success: true,
      data: statistics
    })

  } catch (error) {
    console.error('Error fetching company statistics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Chyba při načítání statistik firem' 
      },
      { status: 500 }
    )
  }
} 