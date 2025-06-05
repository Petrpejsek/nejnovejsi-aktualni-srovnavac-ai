#!/usr/bin/env node
/**
 * 🧪 TEST SCRIPT PRO URL UPLOAD API
 * 
 * Testuje novou funkcionalitu URL uploadů
 */

const fetch = require('node-fetch');

const TEST_URLS = [
  'https://openai.com',
  'https://claude.ai',
  'https://midjourney.com'
];

async function testAPIEndpoint() {
  console.log('🧪 Testování URL Upload API...\n');

  try {
    const response = await fetch('http://localhost:3000/api/products/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls: TEST_URLS
      })
    });

    const data = await response.json();

    console.log('📊 Výsledky testu:');
    console.log('==================');
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`Total processed: ${data.totalProcessed}`);
      console.log(`Success count: ${data.successCount}`);
      console.log(`Fail count: ${data.failCount}\n`);

      console.log('📋 Detailní výsledky:');
      data.results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.url}`);
        console.log(`   ✅ Success: ${result.success}`);
        
        if (result.success) {
          console.log(`   📦 Product: ${result.productName}`);
          console.log(`   🆔 ID: ${result.productId}`);
          console.log(`   📸 Screenshot: ${result.screenshotUrl}`);
        } else {
          console.log(`   ❌ Error: ${result.error}`);
        }
      });
    } else {
      console.log(`❌ Error: ${data.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testScreenshotServer() {
  console.log('\n📸 Testování Screenshot Serveru...\n');

  try {
    // Test health check
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    
    console.log('🏥 Health Check:');
    console.log(`Status: ${healthResponse.status}`);
    console.log(`Service: ${healthData.service}`);
    console.log(`Health: ${healthData.status}\n`);

    // Test screenshot
    const screenshotResponse = await fetch('http://localhost:5000/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://example.com',
        filename: 'test_screenshot.png'
      })
    });

    const screenshotData = await screenshotResponse.json();
    
    console.log('📸 Screenshot Test:');
    console.log(`Status: ${screenshotResponse.status}`);
    console.log(`Success: ${screenshotData.success}`);
    
    if (screenshotData.success) {
      console.log(`Filename: ${screenshotData.filename}`);
      console.log(`URL: ${screenshotData.screenshotUrl}`);
    } else {
      console.log(`Error: ${screenshotData.error}`);
    }

  } catch (error) {
    console.error('❌ Screenshot server test failed:', error.message);
    console.log('💡 Tip: Spusť screenshot server pomocí: ./start-screenshot-server.sh');
  }
}

async function runAllTests() {
  console.log('🚀 Spouštím kompletní test URL Upload systému...\n');
  
  await testScreenshotServer();
  await testAPIEndpoint();
  
  console.log('\n✅ Testy dokončeny!');
  console.log('\n💡 Pro použití admin panelu jdi na: http://localhost:3000/admin/url-upload');
}

// Spustit testy
runAllTests(); 