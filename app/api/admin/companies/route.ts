import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/companies - načtení všech firem pro admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // all, pending, active, suspended
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // Build where clause
    let whereClause: any = {}
    if (status !== 'all') {
      whereClause.status = status
    }

    // Načtení firem s jejich kampaněmi a statistikami
    const companies = await prisma.company.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            isApproved: true,
            totalSpent: true,
            totalClicks: true,
            totalImpressions: true
          }
        },
        _count: {
          select: {
            campaigns: true,
            billingRecords: true
          }
        }
      }
    })

    // Spočítat dodatečné statistiky pro každou firmu
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        // Celkové spend za poslední 30 dní
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentSpend = await prisma.billingRecord.aggregate({
          where: {
            companyId: company.id,
            type: 'spend',
            createdAt: { gte: thirtyDaysAgo }
          },
          _sum: { amount: true }
        })

        // Počet aktivních kampaní
        const activeCampaigns = company.campaigns.filter(c => 
          c.status === 'active' && c.isApproved
        ).length

        // Celkové metriky napříč kampaněmi
        const totalSpent = company.campaigns.reduce((sum, c) => sum + c.totalSpent, 0)
        const totalClicks = company.campaigns.reduce((sum, c) => sum + c.totalClicks, 0)
        const totalImpressions = company.campaigns.reduce((sum, c) => sum + c.totalImpressions, 0)

        return {
          ...company,
          stats: {
            activeCampaigns,
            totalCampaigns: company._count.campaigns,
            totalSpent: Math.round(totalSpent * 100) / 100,
            recentSpend: Math.round((recentSpend._sum.amount || 0) * 100) / 100,
            totalClicks,
            totalImpressions,
            ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
          }
        }
      })
    )

    // Počet celkem pro pagination
    const totalCount = await prisma.company.count({ where: whereClause })

    return NextResponse.json({
      success: true,
      data: {
        companies: companiesWithStats,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching admin companies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

// POST /api/admin/companies - akce na firmy (approve, suspend, activate)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { companyId, action, reason } = data

    if (!companyId || !action) {
      return NextResponse.json(
        { success: false, error: 'Company ID and action are required' },
        { status: 400 }
      )
    }

    // Najít firmu
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let logMessage = ''

    switch (action) {
      case 'approve':
        updateData = { 
          status: 'active',
          isVerified: true
        }
        logMessage = `✅ Company approved: ${company.name} (${company.email})`
        break
        
      case 'suspend':
        updateData = { status: 'suspended' }
        logMessage = `🚫 Company suspended: ${company.name} (${company.email})`
        
        // Pozastavit všechny aktivní kampaně
        await prisma.campaign.updateMany({
          where: { 
            companyId: companyId,
            status: 'active'
          },
          data: { status: 'paused' }
        })
        break
        
      case 'activate':
        updateData = { status: 'active' }
        logMessage = `✅ Company activated: ${company.name} (${company.email})`
        break
        
      case 'reject':
        updateData = { status: 'rejected' }
        logMessage = `❌ Company rejected: ${company.name} (${company.email})`
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Aktualizovat firmu
    await prisma.company.update({
      where: { id: companyId },
      data: updateData
    })

    console.log(logMessage)

    // TODO: Poslat email notifikaci firmě o změně stavu

    return NextResponse.json({
      success: true,
      message: `Company ${action}d successfully`,
      data: {
        companyId,
        action,
        newStatus: updateData.status,
        reason
      }
    })

  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/companies - smazání firmy (jen pending/rejected)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Najít firmu
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        balance: true,
        _count: {
          select: { campaigns: true }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    // Povolit smazání jen u pending/rejected firem bez kampaní
    if (company.status === 'active' || company._count.campaigns > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete active company or company with campaigns' },
        { status: 400 }
      )
    }

    if (company.balance > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete company with remaining balance' },
        { status: 400 }
      )
    }

    // Smazat firmu
    await prisma.company.delete({
      where: { id: companyId }
    })

    console.log(`🗑️ Company deleted: ${company.name} (${company.email})`)

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete company' },
      { status: 500 }
    )
  }
} 