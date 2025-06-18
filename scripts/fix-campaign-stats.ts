import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCampaignStats() {
  try {
    console.log('🔄 Opravuji statistiky kampaní...')

    // Načteme všechny kampaně
    const campaigns = await prisma.campaign.findMany({
      include: {
        AdClick: {
          select: {
            costPerClick: true,
            clickedAt: true
          }
        }
      }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const campaign of campaigns) {
      // Spočítáme dnešní kliknutí
      const todayClicks = campaign.AdClick.filter(click => 
        new Date(click.clickedAt) >= today
      )
      
      const correctTodaySpent = todayClicks.reduce((sum, click) => sum + click.costPerClick, 0)
      const correctTodayClicks = todayClicks.length

      // Spočítáme celkové kliknutí
      const correctTotalSpent = campaign.AdClick.reduce((sum, click) => sum + click.costPerClick, 0)
      const correctTotalClicks = campaign.AdClick.length

      console.log(`📊 Kampaň: ${campaign.name}`)
      console.log(`   DB today: ${campaign.todaySpent} USD, ${campaign.todayClicks} clicks`)
      console.log(`   Správně: ${correctTodaySpent} USD, ${correctTodayClicks} clicks`)
      console.log(`   DB total: ${campaign.totalSpent} USD, ${campaign.totalClicks} clicks`)
      console.log(`   Správně: ${correctTotalSpent} USD, ${correctTotalClicks} clicks`)

      // Aktualizujeme pouze pokud se hodnoty liší
      if (
        campaign.todaySpent !== correctTodaySpent ||
        campaign.todayClicks !== correctTodayClicks ||
        campaign.totalSpent !== correctTotalSpent ||
        campaign.totalClicks !== correctTotalClicks
      ) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            todaySpent: correctTodaySpent,
            todayClicks: correctTodayClicks,
            totalSpent: correctTotalSpent,
            totalClicks: correctTotalClicks
          }
        })
        console.log(`   ✅ Opraveno!`)
      } else {
        console.log(`   ✅ Statistiky jsou správné`)
      }
      console.log('')
    }

    console.log('🎉 Všechny statistiky kampaní byly opraveny!')

  } catch (error) {
    console.error('❌ Chyba při opravě statistik:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Spustíme script
fixCampaignStats() 