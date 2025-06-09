import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Přečti query parametr pro filtrování podle statusu
    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status') // 'pending', 'approved', nebo null pro všechny
    
    // Vytvoř where podmínku podle parametru
    let whereCondition: any = {}
    
    // Pokud je specifikován status, přidej ho do filtru
    if (statusFilter) {
      whereCondition.status = statusFilter
    }
    
    const advertisers = await prisma.company.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        contactPerson: true,
        website: true,
        description: true,
        status: true,
        isVerified: true,
        balance: true,
        totalSpent: true,
        assignedProductId: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            Campaign: true,
            AdClick: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Přeformátování pro frontend
    const formattedCompanies = advertisers.map(company => ({
      id: company.id,
      name: company.name,
      email: company.email,
      contactPerson: company.contactPerson,
      website: company.website || '',
      description: company.description || '',
      status: company.status,
      isVerified: company.isVerified,
      balance: company.balance,
      totalSpent: company.totalSpent,
      assignedProductId: company.assignedProductId,
      createdAt: company.createdAt.toISOString(),
      lastLoginAt: company.lastLoginAt?.toISOString() || null,
      campaignCount: company._count.Campaign,
      clickCount: company._count.AdClick,
      type: 'advertiser' as const
    }))

    return NextResponse.json({
      success: true,
      data: formattedCompanies
    })

  } catch (error) {
    console.error('Error fetching advertisers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advertisers' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Dočasně bez auth pro testování

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('id')
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const { action, assignedProductId } = data

    if (action === 'approve') {
      // Schválení PPC inzerenta - změníme status na approved
      const updateData: any = {
        status: 'approved',
        updatedAt: new Date()
      }

      // Pokud je zároveň přiřazen produkt
      if (assignedProductId) {
        updateData.assignedProductId = assignedProductId
      }

      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: updateData
      })

      console.log(`✅ Admin approved advertiser company: ${updatedCompany.name} (${companyId})${assignedProductId ? ` with product ${assignedProductId}` : ''}`)

      return NextResponse.json({
        success: true,
        data: updatedCompany,
        message: 'PPC Advertiser approved successfully'
      })
    }

    if (action === 'assign-product') {
      // Přiřazení produktu k již schválenému inzerentovi
      if (!assignedProductId) {
        return NextResponse.json(
          { success: false, error: 'Product ID is required' },
          { status: 400 }
        )
      }

      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: {
          assignedProductId: assignedProductId,
          updatedAt: new Date()
        }
      })

      console.log(`🔗 Admin assigned product ${assignedProductId} to advertiser: ${updatedCompany.name} (${companyId})`)

      return NextResponse.json({
        success: true,
        data: updatedCompany,
        message: 'Product assigned successfully'
      })
    }

    if (action === 'reject') {
      // Zamítnutí PPC inzerenta - změníme status na rejected
      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: {
          status: 'rejected',
          updatedAt: new Date()
        }
      })

      console.log(`❌ Admin rejected advertiser company: ${updatedCompany.name} (${companyId})`)

      return NextResponse.json({
        success: true,
        data: updatedCompany,
        message: 'PPC Advertiser rejected successfully'
      })
    }

    // Původní logika pro ostatní úpravy
    const { status, balance, notes } = data
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        status: status || undefined,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
        updatedAt: new Date()
      }
    })

    console.log(`📝 Admin updated advertiser company ${companyId}: status=${status}, balance=${balance}`)

    return NextResponse.json({
      success: true,
      data: updatedCompany
    })

  } catch (error) {
    console.error('Error updating advertiser company:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Dočasně bez auth pro testování

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('id')
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Ověříme že company existuje
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    // Smažeme PPC inzerenta
    await prisma.company.delete({
      where: { id: companyId }
    })

    console.log(`🗑️ Admin deleted advertiser company: ${company.name} (${companyId})`)

    return NextResponse.json({
      success: true,
      message: 'Advertiser company deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting advertiser company:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete company' },
      { status: 500 }
    )
  }
} 