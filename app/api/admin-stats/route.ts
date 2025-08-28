import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Získáme skutečné počty z databáze paralelně
    const [
      // Products
      totalProducts,
      activeProducts,
      pendingProductChanges,
      draftProducts,
      // Click analytics
      totalClicks,
      uniqueVisitors,
      // Users
      totalUsers,
      activeUsers,
      // Companies
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      verifiedCompanies,
      // Landing pages
      totalLandingPages,
      // Company applications (separate table)
      companyApplicationsStats
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      prisma.product.count({ where: { hasPendingChanges: true, changesStatus: 'pending', deletedAt: null } }),
      prisma.product.count({ where: { isActive: false, deletedAt: null } }),
      prisma.click.count(),
      prisma.click.groupBy({ by: ['visitorId'], _count: true }).then((rows) => rows.length),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.company.count(),
      prisma.company.count({ where: { status: 'active' } }),
      prisma.company.count({ where: { status: 'pending' } }),
      prisma.company.count({ where: { isVerified: true } }),
      prisma.landing_pages.count(),
      prisma.companyApplications.groupBy({ by: ['status'], _count: true })
    ])

    // Statistiky pro pending changes - rozlišíme nové produkty vs úpravy (best effort, pouze z reálných dat)
    const pendingChangesResult = await prisma.$queryRaw<any[]>`
      SELECT 
        "imageApprovalStatus" as status,
        COUNT(*)::int as count
      FROM "Product"
      WHERE "hasPendingChanges" = true AND "changesStatus" = 'pending' AND "deletedAt" IS NULL
      GROUP BY "imageApprovalStatus"
    `

    let newProductsPending = 0
    let productEditsPending = 0
    for (const row of pendingChangesResult) {
      const isNew = row.status === 'NEW_PRODUCT'
      if (isNew) newProductsPending += Number(row.count || 0)
      else productEditsPending += Number(row.count || 0)
    }
    const totalPendingChanges = Number(pendingProductChanges)

    // Spočítáme statistiky pro firemní aplikace s explicitními typy
    const companyStats: Record<string, number> = companyApplicationsStats.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
      acc[item.status] = item._count
      return acc
    }, { pending: 0, approved: 0, rejected: 0 })

    // Sjednocení „čekajících žádostí“: zahrň i Companies.status='pending' (PPC inzerenti čekající na schválení)
    const unifiedPendingApplications = (companyStats.pending || 0) + (pendingCompanies || 0)
    const unifiedTotalApplications = unifiedPendingApplications + (companyStats.approved || 0) + (companyStats.rejected || 0)

    // Vytvoříme statistiky pouze z reálných dat
    const stats = {
      products: {
        total: totalProducts,
        active: activeProducts,
        pending: totalPendingChanges,
        draft: draftProducts
      },
      courses: {
        total: 0,
        published: 0,
        draft: 0,
        enrolled: 0
      },
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        pending: pendingCompanies,
        verified: verifiedCompanies
      },
      pages: {
        total: totalLandingPages,
        published: totalLandingPages,
        draft: 0
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        companies: activeCompanies
      },
      analytics: {
        totalClicks,
        uniqueVisitors
      },
      // Nové: Specifické statistiky pro company applications (sjednocené s PPC inzerenty)
      companyApplications: {
        total: unifiedTotalApplications,
        pending: unifiedPendingApplications,
        approved: companyStats.approved,
        rejected: companyStats.rejected
      },
      // Nové: Pending product changes - rozlišené podle typu
      pendingProductChanges: {
        total: totalPendingChanges,
        newProducts: newProductsPending,
        productEdits: productEditsPending
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
              { error: 'Error loading statistics' },
      { status: 500 }
    )
  }
} 