#!/usr/bin/env node

/**
 * 🍪 Test script pro ověření vylepšeného cookies handling
 * 
 * Testuje různé weby s cookies bannery a ukazuje jak dobře
 * náš vylepšený screenshot server zvládá cookies.
 */

const https = require('https');

// Test URLs s různými typy cookies bannerů
const testUrls = [
  {
    url: 'https://cookiebot.com',
    name: 'cookiebot-demo',
    description: 'Web s Cookiebot řešením'
  },
  {
    url: 'https://gdpr.eu', 
    name: 'gdpr-info',
    description: 'GDPR informační web'
  },
  {
    url: 'https://example.com',
    name: 'example-simple',
    description: 'Jednoduchý web bez cookies'
  }
];

async function makeScreenshotRequest(testCase) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      url: testCase.url,
      name: testCase.name
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/screenshot',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            ...testCase,
            result
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testCookiesHandling() {
  console.log('🍪 Test vylepšeného cookies handling');
  console.log('=' .repeat(50));
  
  for (const testCase of testUrls) {
    try {
      console.log(`\n📸 Testování: ${testCase.description}`);
      console.log(`   URL: ${testCase.url}`);
      console.log(`   ⏳ Vytváím screenshot...`);
      
      const startTime = Date.now();
      const response = await makeScreenshotRequest(testCase);
      const duration = Date.now() - startTime;
      
      if (response.result.success) {
        const cookiesStatus = response.result.cookies_handled ? '✅ Cookies zpracovány' : '⚪ Žádné cookies';
        console.log(`   ${cookiesStatus}`);
        console.log(`   📁 Screenshot: ${response.result.filename}`);
        console.log(`   ⏱️  Doba: ${duration}ms`);
        console.log(`   🎯 Výsledek: ✅ ÚSPĚCH`);
      } else {
        console.log(`   ❌ CHYBA: ${response.result.error}`);
      }
      
    } catch (error) {
      console.log(`   💥 Chyba: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Test dokončen!');
  console.log('\n💡 Pro zobrazení screenshotů otevři: http://localhost:3000/admin/url-upload');
}

// Spustit test
testCookiesHandling().catch(console.error); 