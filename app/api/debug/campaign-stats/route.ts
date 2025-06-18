import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Načteme všechny kampaně s jejich kliknutími
    const campaigns = await prisma.campaign.findMany({
      include: {
        Company: {
          select: {
            name: true,
            balance: true
          }
        },
        AdClick: {
          select: {
            id: true,
            costPerClick: true,
            clickedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const campaignStats = campaigns.map(campaign => {
      // Dnešní kliknutí
      const todayClicks = campaign.AdClick.filter(click => 
        new Date(click.clickedAt) >= today
      )
      
      const todaySpent = todayClicks.reduce((sum, click) => sum + click.costPerClick, 0)
      const todayClicksCount = todayClicks.length

      // Celková statistika
      const totalSpent = campaign.AdClick.reduce((sum, click) => sum + click.costPerClick, 0)
      const totalClicks = campaign.AdClick.length

      return {
        id: campaign.id,
        name: campaign.name,
        companyName: campaign.Company.name,
        companyBalance: campaign.Company.balance,
        status: campaign.status,
        isApproved: campaign.isApproved,
        dailyBudget: campaign.dailyBudget,
        bidAmount: campaign.bidAmount,
        
        // Databázová data
        dbTodaySpent: campaign.todaySpent,
        dbTodayClicks: campaign.todayClicks,
        dbTotalSpent: campaign.totalSpent,
        dbTotalClicks: campaign.totalClicks,
        
        // Vypočítaná data z kliknutí
        calculatedTodaySpent: todaySpent,
        calculatedTodayClicks: todayClicksCount,
        calculatedTotalSpent: totalSpent,
        calculatedTotalClicks: totalClicks,
        
        // Procenta budgetu
        budgetUsedPercentage: Math.round((todaySpent / campaign.dailyBudget) * 100),
        
        // Všechna kliknutí pro debug
        allClicks: campaign.AdClick.map(click => ({
          id: click.id,
          cost: click.costPerClick,
          date: click.clickedAt,
          isToday: new Date(click.clickedAt) >= today
        }))
      }
    })

    return NextResponse.json({
      success: true,
      totalCampaigns: campaigns.length,
      campaignStats
    })

  } catch (error) {
    console.error('❌ Error fetching campaign stats:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 