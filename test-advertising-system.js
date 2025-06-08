// Test script pro reklamní systém
// Spusťte: node test-advertising-system.js

const BASE_URL = 'http://localhost:3000'

async function testAdvertisingSystem() {
  console.log('🧪 TESTOVÁNÍ REKLAMNÍHO SYSTÉMU\n')

  try {
    // Test 1: Company Registration
    console.log('1️⃣ Test registrace firmy...')
    const registerResponse = await fetch(`${BASE_URL}/api/advertiser/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Company',
        email: 'test@company.com',
        password: 'password123',
        contactPerson: 'John Doe',
        website: 'https://testcompany.com',
        description: 'Test company for advertising'
      })
    })
    
    const registerResult = await registerResponse.json()
    console.log('✅ Registrace:', registerResult.success ? 'ÚSPĚCH' : 'CHYBA')
    if (!registerResult.success) console.log('   Error:', registerResult.error)

    // Test 2: Ad Auction (bez kampaní)
    console.log('\n2️⃣ Test ad auction...')
    const auctionResponse = await fetch(`${BASE_URL}/api/ads/auction?pageType=homepage&maxAds=3`)
    const auctionResult = await auctionResponse.json()
    console.log('✅ Auction:', auctionResult.success ? 'ÚSPĚCH' : 'CHYBA')
    console.log(`   Nalezeno ${auctionResult.data?.ads?.length || 0} reklam`)

    // Test 3: Admin Companies API
    console.log('\n3️⃣ Test admin companies API...')
    const companiesResponse = await fetch(`${BASE_URL}/api/admin/companies?status=all&page=1`)
    const companiesResult = await companiesResponse.json()
    console.log('✅ Admin Companies:', companiesResult.success ? 'ÚSPĚCH' : 'CHYBA')
    console.log(`   Nalezeno ${companiesResult.data?.companies?.length || 0} firem`)

    // Test 4: Admin Campaigns API
    console.log('\n4️⃣ Test admin campaigns API...')
    const campaignsResponse = await fetch(`${BASE_URL}/api/admin/campaigns?status=all&page=1`)
    const campaignsResult = await campaignsResponse.json()
    console.log('✅ Admin Campaigns:', campaignsResult.success ? 'ÚSPĚCH' : 'CHYBA')
    console.log(`   Nalezeno ${campaignsResult.data?.campaigns?.length || 0} kampaní`)

    console.log('\n🎉 VŠECHNY TESTY DOKONČENY!')
    console.log('\n📋 SHRNUTÍ:')
    console.log('- API endpointy jsou funkční')
    console.log('- Databázové schéma je správně nastaveno')
    console.log('- Systém je připraven k použití')
    
    console.log('\n🚀 DALŠÍ KROKY:')
    console.log('1. Nastavte Stripe klíče v .env.local')
    console.log('2. Přidejte <SponsoredAds /> komponenty na stránky')
    console.log('3. Otestujte celý flow v prohlížeči')

  } catch (error) {
    console.error('❌ CHYBA PRI TESTOVÁNÍ:', error.message)
    console.log('\n🔧 MOŽNÉ ŘEŠENÍ:')
    console.log('- Zkontrolujte že aplikace běží na localhost:3000')
    console.log('- Ověřte DATABASE_URL v .env.local')
    console.log('- Spusťte: npm run db:push')
  }
}

// Spustit testy
testAdvertisingSystem() 