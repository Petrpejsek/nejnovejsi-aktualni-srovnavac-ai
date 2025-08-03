import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTracking() {
  console.log('🔍 Checking tracking data...');
  
  // Check AdClick tracking
  const adClicks = await prisma.adClickMonetization.findMany({
    where: { partnerId: 'test-partner-openai' },
    orderBy: { timestamp: 'desc' }
  });
  
  console.log('💰 CPC Clicks:', adClicks.length);
  if (adClicks.length > 0) {
    console.log('   Latest click cost: $' + adClicks[0].costPerClick);
    console.log('   Entity:', adClicks[0].monetizableType + '/' + adClicks[0].monetizableId);
  }
  
  // Check affiliate clicks
  const affiliateClicks = await prisma.affiliateClick.findMany({
    where: { partnerId: 'test-partner-openai' },
    orderBy: { timestamp: 'desc' }
  });
  
  console.log('🔗 Affiliate Clicks:', affiliateClicks.length);
  
  // Check billing account
  const account = await prisma.billingAccount.findUnique({
    where: { partnerId: 'test-partner-openai' }
  });
  
  console.log('💳 Balance: $' + account.creditBalance + ', Spent: $' + account.totalSpent);
  
  // Check config stats
  const configs = await prisma.monetizationConfig.findMany({
    where: { partnerId: 'test-partner-openai' },
    orderBy: { refCode: 'asc' }
  });
  
  console.log('\n📊 Config Statistics:');
  configs.forEach(config => {
    console.log(`   ${config.mode.toUpperCase()}: ${config.totalClicks} total, ${config.totalCpcClicks} CPC, ${config.totalAffiliateClicks} affiliate`);
  });
  
  await prisma.$disconnect();
}

checkTracking().catch(console.error);