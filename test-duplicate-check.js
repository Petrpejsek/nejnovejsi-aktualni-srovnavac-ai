#!/usr/bin/env node
/**
 * 🧪 TEST SCRIPT PRO KONTROLU DUPLICIT
 * 
 * Testuje novou funkcionalitu kontroly duplicit před scrapingem
 */

// Pro Node.js vestavěný fetch (Node 18+)
const fetch = globalThis.fetch;

// Testovací URL - nějaké by měly být duplicitní pokud máte produkty v databázi
const TEST_URLS = [
  'https://openai.com',
  'https://claude.ai',
  'https://midjourney.com',
  'https://notion.so',
  'https://example-neexistuje.com',  // Tato by neměla být duplicitní
  'https://chatgpt.com'
];

async function testDuplicateCheck() {
  console.log('🧪 Testování kontroly duplicit před scrapingem...\n');

  try {
    const response = await fetch('http://localhost:3000/api/products/check-duplicates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls: TEST_URLS
      })
    });

    const data = await response.json();

    console.log('📊 Výsledky kontroly duplicit:');
    console.log('============================');
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n📋 Statistiky:`);
      console.log(`   Celkem zkontrolováno: ${data.totalChecked}`);
      console.log(`   Duplicit nalezeno: ${data.duplicatesCount}`);
      console.log(`   Unikátních URL: ${data.uniqueCount}`);

      if (data.duplicatesCount > 0) {
        console.log(`\n🔍 Detaily duplicit:`);
        data.duplicateDetails.forEach((dup, index) => {
          console.log(`   ${index + 1}. ${dup.url}`);
          console.log(`      → Existuje jako: ${dup.existingProduct}`);
        });

        console.log(`\n✅ Unikátní URL pro scraping:`);
        data.uniqueUrls.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`);
        });
      } else {
        console.log(`\n🎉 Žádné duplicity nenalezeny!`);
      }

    } else {
      console.log(`❌ Error: ${data.error}`);
    }

  } catch (error) {
    console.error('❌ Test selhal:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Spouštím test kontroly duplicit...\n');
  
  await testDuplicateCheck();
  
  console.log('\n✅ Test dokončen!');
  console.log('\n💡 Pro použití admin panelu jdi na: http://localhost:3000/admin/url-upload');
}

runTest(); 