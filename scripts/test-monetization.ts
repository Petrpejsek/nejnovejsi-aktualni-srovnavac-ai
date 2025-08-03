/**
 * Test script for monetization system
 * Run with: npx ts-node scripts/test-monetization.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Monetization System...\n')

  try {
    // 1. Create a test partner (billing account)
    const testPartnerId = 'test-partner-openai'
    
    console.log('1️⃣ Creating test billing account...')
    const billingAccount = await prisma.billingAccount.upsert({
      where: { partnerId: testPartnerId },
      create: {
        partnerId: testPartnerId,
        creditBalance: 100.0, // $100 test credit
        totalDeposited: 100.0,
        isActive: true,
        autoRechargeEnabled: false
      },
      update: {
        creditBalance: 100.0,
        isActive: true
      }
    })
    console.log('✅ Billing account created:', billingAccount.partnerId)

    // 2. Find a test product
    console.log('\n2️⃣ Finding test product...')
    const testProduct = await prisma.product.findFirst({
      where: {
        isActive: true,
        externalUrl: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        externalUrl: true
      }
    })

    if (!testProduct) {
      throw new Error('No active product found for testing')
    }
    console.log('✅ Test product found:', testProduct.name)

    // 3. Create monetization configurations for all modes
    const configs = [
      {
        mode: 'cpc' as const,
        refCode: `test-cpc-${testProduct.id}`,
        cpcRate: 0.50,
        affiliateRate: null,
        affiliateLink: null,
        fallbackLink: testProduct.externalUrl
      },
      {
        mode: 'affiliate' as const,
        refCode: `test-affiliate-${testProduct.id}`,
        cpcRate: null,
        affiliateRate: 10.0,
        affiliateLink: `${testProduct.externalUrl}?ref=test-affiliate-${testProduct.id}`,
        fallbackLink: testProduct.externalUrl
      },
      {
        mode: 'hybrid' as const,
        refCode: `test-hybrid-${testProduct.id}`,
        cpcRate: 0.25,
        affiliateRate: 15.0,
        affiliateLink: `${testProduct.externalUrl}?ref=test-hybrid-${testProduct.id}`,
        fallbackLink: testProduct.externalUrl
      }
    ]

    console.log('\n3️⃣ Creating monetization configurations...')
    for (const configData of configs) {
      const config = await prisma.monetizationConfig.upsert({
        where: { refCode: configData.refCode },
        create: {
          monetizableType: 'Product',
          monetizableId: testProduct.id,
          mode: configData.mode,
          refCode: configData.refCode,
          partnerId: testPartnerId,
          cpcRate: configData.cpcRate,
          affiliateRate: configData.affiliateRate,
          affiliateLink: configData.affiliateLink,
          fallbackLink: configData.fallbackLink,
          isActive: true,
          createdBy: 'test-script'
        },
        update: {
          isActive: true,
          cpcRate: configData.cpcRate,
          affiliateRate: configData.affiliateRate,
          affiliateLink: configData.affiliateLink
        }
      })
      console.log(`✅ ${configData.mode.toUpperCase()} config created: ${config.refCode}`)
    }

    // 4. Display test URLs
    console.log('\n4️⃣ Test URLs:')
    console.log('📊 CPC Mode:')
    console.log(`   http://localhost:3000/api/monetization/out/Product/${testProduct.id}?ref=test-cpc-${testProduct.id}`)
    
    console.log('🔗 Affiliate Mode:')
    console.log(`   http://localhost:3000/api/monetization/out/Product/${testProduct.id}?ref=test-affiliate-${testProduct.id}`)
    
    console.log('🎯 Hybrid Mode:')
    console.log(`   http://localhost:3000/api/monetization/out/Product/${testProduct.id}?ref=test-hybrid-${testProduct.id}`)

    console.log('\n5️⃣ Conversion tracking examples:')
    console.log('Webhook URL:')
    console.log('   POST http://localhost:3000/api/monetization/conversion')
    console.log('   Body: {')
    console.log('     "ref_code": "test-affiliate-' + testProduct.id + '",')
    console.log('     "conversion_type": "subscription",')
    console.log('     "conversion_value": 29.99')
    console.log('   }')
    
    console.log('\nPixel URL:')
    console.log(`   http://localhost:3000/api/monetization/conversion.gif?ref=test-affiliate-${testProduct.id}&type=subscription&value=29.99`)

    // 6. Show current state
    console.log('\n6️⃣ Current monetization state:')
    const allConfigs = await prisma.monetizationConfig.findMany({
      where: { partnerId: testPartnerId },
      include: {
        affiliateClicks: { select: { id: true } },
        conversions: { select: { id: true } }
      }
    })

    allConfigs.forEach(config => {
      console.log(`📈 ${config.mode.toUpperCase()}: ${config.refCode}`)
      console.log(`   Clicks: ${config.totalClicks}, Conversions: ${config.totalConversions}`)
      console.log(`   Revenue: $${config.totalRevenue}`)
    })

    const currentBalance = await prisma.billingAccount.findUnique({
      where: { partnerId: testPartnerId },
      select: { creditBalance: true, totalSpent: true }
    })

    console.log(`💰 Partner Balance: $${currentBalance?.creditBalance}, Spent: $${currentBalance?.totalSpent}`)

    console.log('\n✅ Monetization system test setup complete!')
    console.log('\n📝 Next steps:')
    console.log('1. Test clicking the URLs above in browser')
    console.log('2. Check database for click tracking')
    console.log('3. Test conversion webhooks/pixels')
    console.log('4. Set up real Stripe keys for billing')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Cleanup function
async function cleanup() {
  console.log('🧹 Cleaning up test data...')
  
  const testPartnerId = 'test-partner-openai'
  
  // Delete test configurations
  await prisma.monetizationConfig.deleteMany({
    where: {
      partnerId: testPartnerId,
      refCode: {
        startsWith: 'test-'
      }
    }
  })

  // Delete billing account
  await prisma.billingAccount.deleteMany({
    where: { partnerId: testPartnerId }
  })

  console.log('✅ Cleanup complete')
  await prisma.$disconnect()
}

// Check if cleanup argument is provided
if (process.argv.includes('--cleanup')) {
  cleanup().catch(console.error)
} else {
  main().catch(console.error)
}

export { main, cleanup }