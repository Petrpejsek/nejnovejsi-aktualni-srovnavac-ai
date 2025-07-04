import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Získáme skutečné počty z databáze paralelně
    const [
      totalProducts,
      totalClicks,
      uniqueVisitors,
      companyApplicationsStats
    ] = await Promise.all([
      prisma.product.count(),
      prisma.click.count(),
      prisma.click.groupBy({
        by: ['visitorId'],
        _count: true
      }).then(visitors => visitors.length),
      // Nové: Statistiky CompanyApplications - nyní aktivní
      prisma.companyApplications.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    // Statistiky pro pending changes - rozlišíme nové produkty a úpravy
    const pendingChangesResult = await prisma.$queryRaw`
      SELECT 
        "imageApprovalStatus",
        "adminNotes",
        COUNT(*) as count 
      FROM "Product" 
      WHERE "hasPendingChanges" = true 
      AND "changesStatus" = 'pending'
      AND "deletedAt" IS NULL
      GROUP BY "imageApprovalStatus", "adminNotes"
    ` as Array<{imageApprovalStatus: string | null, adminNotes: string | null, count: bigint}>
    
    // Rozděl podle typu (nové produkty vs úpravy)
    let newProductsPending = 0
    let productEditsPending = 0
    
    pendingChangesResult.forEach((item) => {
      const count = Number(item.count)
      const isNewProduct = item.imageApprovalStatus === 'NEW_PRODUCT' || 
                          (item.adminNotes && item.adminNotes.includes('NEW PRODUCT'))
      
      if (isNewProduct) {
        newProductsPending += count
      } else {
        productEditsPending += count
      }
    })
    
    const totalPendingChanges = newProductsPending + productEditsPending

    // Spočítáme statistiky pro firemní aplikace s explicitními typy
    const companyStats: Record<string, number> = companyApplicationsStats.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
      acc[item.status] = item._count
      return acc
    }, { pending: 0, approved: 0, rejected: 0 })

    // Vytvoříme statistiky s reálnými i statickými daty
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
        total: companyStats.pending + companyStats.approved + companyStats.rejected,
        active: companyStats.approved,
        pending: companyStats.pending,
        verified: companyStats.approved,
        rejected: companyStats.rejected
      },
      pages: {
        total: 12, // Statické data - stránky zatím nejsou v databázi
        published: 10,
        draft: 2
      },
      users: {
        total: 156, // Statické data - uživatelé zatím nejsou v databázi
        active: 134,
        companies: companyStats.approved
      },
      analytics: {
        totalClicks,
        uniqueVisitors
      },
      // Nové: Specifické statistiky pro company applications
      companyApplications: {
        total: companyStats.pending + companyStats.approved + companyStats.rejected,
        pending: companyStats.pending,
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
      { error: 'Chyba při načítání statistik' },
      { status: 500 }
    )
  }
} 