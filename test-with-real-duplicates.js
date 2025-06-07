#!/usr/bin/env node
/**
 * 🧪 TEST S REÁLNÝMI DUPLICITY
 * 
 * Testuje kontrolu duplicit s URL, které mohou být skutečně v databázi
 */

// Pro Node.js vestavěný fetch (Node 18+)
const fetch = globalThis.fetch;

// URL které jsou velmi pravděpodobně už v databázi
const LIKELY_DUPLICATE_URLS = [
  'https://openai.com',
  'https://openai.com/',         // S koncovým lomítkem - mělo by být detekováno jako duplicita
  'https://OPENAI.COM',          // Různé velikosti písmen
  'https://claude.ai',
  'https://midjourney.com',
  'https://notion.so',
  'https://chatgpt.com',
  'https://example-definitely-not-exists-123456.com',  // Tato určitě není duplicitní
];

async function testWithRealDuplicates() {
  console.log('🧪 Test s potenciálními reálnými duplicity...\n');
  console.log('Testovací URL:');
  LIKELY_DUPLICATE_URLS.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/products/check-duplicates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls: LIKELY_DUPLICATE_URLS
      })
    });

    const data = await response.json();

    console.log('📊 Výsledky kontroly:');
    console.log('====================');
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}\n`);
    
    if (data.success) {
      console.log(`📈 Statistiky:`);
      console.log(`   📋 Celkem zkontrolováno: ${data.totalChecked}`);
      console.log(`   🔴 Duplicit nalezeno: ${data.duplicatesCount}`);
      console.log(`   🟢 Unikátních URL: ${data.uniqueCount}\n`);

      if (data.duplicatesCount > 0) {
        console.log(`🔍 Nalezené duplicity:`);
        console.log('====================');
        data.duplicateDetails.forEach((dup, index) => {
          console.log(`${index + 1}. URL: ${dup.url}`);
          console.log(`   ↳ Existuje v DB jako: "${dup.existingProduct}"`);
          console.log('');
        });

        console.log(`✅ Unikátní URL pro scraping:`);
        console.log('============================');
        data.uniqueUrls.forEach((url, index) => {
          console.log(`${index + 1}. ${url}`);
        });

        console.log(`\n💡 Simulace zprávy pro uživatele:`);
        console.log(`🔍 Kontrola duplicit dokončena!`);
        console.log(`📊 Celkem zkontrolováno: ${data.totalChecked} URL`);
        console.log(`🗑️ Duplicit odstraněno: ${data.duplicatesCount}`);
        console.log(`✅ Unikátních URL zůstalo: ${data.uniqueCount}`);

      } else {
        console.log(`🎉 Žádné duplicity nenalezeny! Všechny URL jsou unikátní.`);
      }

    } else {
      console.log(`❌ Chyba: ${data.error}`);
    }

  } catch (error) {
    console.error('❌ Test selhal:', error.message);
  }
}

testWithRealDuplicates(); 