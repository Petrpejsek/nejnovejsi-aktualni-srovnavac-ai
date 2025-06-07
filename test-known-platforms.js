#!/usr/bin/env node
/**
 * 🧪 TEST SE ZNÁMÝMI PLATFORMAMI
 * 
 * Testuje kontrolu duplicit s platformami, které jsou už v databázi
 */

// Pro Node.js vestavěný fetch (Node 18+)
const fetch = globalThis.fetch;

// URL platforem ze screenshotů, které jsou už v databázi
const KNOWN_PLATFORM_URLS = [
  'https://gtm.ai',
  'https://www.gtm.ai',        // S www
  'https://napkin.ai',
  'https://www.napkin.ai',     // S www  
  'https://guru.com',
  'https://www.guru.com',      // S www
  'https://guru.com/',         // S koncovým lomítkem
  'https://GURU.COM',          // Velká písmena
  'https://new-platform-definitely-not-in-db.com'  // Tato určitě není
];

async function testKnownPlatforms() {
  console.log('🧪 Test se známými platformami z databáze...\n');
  
  console.log('🎯 Testované URL (platformy ze screenshotů):');
  KNOWN_PLATFORM_URLS.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });
  console.log('');

  try {
    console.log('🔍 Spouštím kontrolu duplicit...');
    
    const response = await fetch('http://localhost:3000/api/products/check-duplicates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls: KNOWN_PLATFORM_URLS
      })
    });

    const data = await response.json();

    console.log('\n📊 VÝSLEDKY KONTROLY:');
    console.log('=====================');
    console.log(`🌐 Status: ${response.status}`);
    console.log(`✅ Success: ${data.success}\n`);
    
    if (data.success) {
      // Barevné statistiky
      console.log(`📈 STATISTIKY:`);
      console.log(`📋 Celkem zkontrolováno: ${data.totalChecked} URL`);
      console.log(`🔴 Duplicit nalezeno: ${data.duplicatesCount}`);
      console.log(`🟢 Unikátních URL: ${data.uniqueCount}\n`);

      if (data.duplicatesCount > 0) {
        console.log(`🎯 NALEZENÉ DUPLICITY:`);
        console.log('======================');
        data.duplicateDetails.forEach((dup, index) => {
          console.log(`${index + 1}. 🔗 ${dup.url}`);
          console.log(`   📦 Existuje v DB jako: "${dup.existingProduct}"`);
          console.log('');
        });

        console.log(`✨ UNIKÁTNÍ URL PRO SCRAPING:`);
        console.log('=============================');
        if (data.uniqueUrls.length > 0) {
          data.uniqueUrls.forEach((url, index) => {
            console.log(`${index + 1}. 🆕 ${url}`);
          });
        } else {
          console.log('   🚫 Žádné unikátní URL - všechny byly duplicitní!');
        }

        console.log(`\n💡 SIMULACE ZPRÁVY PRO UŽIVATELE:`);
        console.log('==================================');
        console.log(`🔍 Kontrola duplicit dokončena!`);
        console.log(`📊 Celkem zkontrolováno: ${data.totalChecked} URL`);
        console.log(`🗑️ Duplicit odstraněno: ${data.duplicatesCount}`);
        console.log(`✅ Unikátních URL zůstalo: ${data.uniqueCount}`);
        
        if (data.uniqueCount === 0) {
          console.log(`🚫 Všechny URL byly duplicitní. Nepokračuji se scrapingem.`);
        } else {
          console.log(`🚀 Pokračuji se scrapingem ${data.uniqueCount} unikátních URL...`);
        }

      } else {
        console.log(`🎉 ŽÁDNÉ DUPLICITY NENALEZENY!`);
        console.log(`🆕 Všechny URL jsou unikátní a lze je použít pro scraping.`);
      }

    } else {
      console.log(`❌ CHYBA: ${data.error}`);
    }

  } catch (error) {
    console.error('❌ Test selhal:', error.message);
  }
}

console.log('🚀 Testování kontroly duplicit s známými platformami...\n');
testKnownPlatforms(); 