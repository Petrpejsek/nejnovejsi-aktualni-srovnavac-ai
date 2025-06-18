import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Debug endpoint - zobrazit všechny firmy a jejich kampaně
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        status: true
      }
    })

    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        companyId: true,
        status: true,
        isApproved: true,
        bidAmount: true,
        dailyBudget: true,
        totalSpent: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Spojit s company info
    const companiesWithCampaigns = companies.map(company => ({
      ...company,
      campaigns: campaigns.filter(c => c.companyId === company.id)
    }))

    return NextResponse.json({
      success: true,
      data: {
        companies: companiesWithCampaigns,
        totalCompanies: companies.length,
        totalCampaigns: campaigns.length
      }
    })

  } catch (error) {
    console.error('Debug Error:', error)
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    )
  }
} 