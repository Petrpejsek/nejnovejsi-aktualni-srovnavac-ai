#!/usr/bin/env node

/**
 * Script pro nahrání screenshotů na Vercel Blob Storage
 * Použití: node scripts/upload-screenshots.js
 */

const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// Konfigurace
const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('❌ Chybí BLOB_READ_WRITE_TOKEN v environment variables');
  process.exit(1);
}

/**
 * Nahraje všechny PNG screenshoty na Vercel Blob
 */
async function uploadScreenshots() {
  try {
    console.log('🚀 Zahajuji nahrávání screenshotů...');
    
    // Načti všechny PNG soubory
    const files = fs.readdirSync(SCREENSHOTS_DIR)
      .filter(file => file.endsWith('.png'))
      .filter(file => !file.includes('placeholder')); // Přeskoč placeholdery

    if (files.length === 0) {
      console.log('📂 Nenalezeny žádné PNG screenshoty k nahrání');
      return;
    }

    console.log(`📋 Nalezeno ${files.length} screenshotů k nahrání:`);
    files.forEach(file => console.log(`   - ${file}`));

    const results = [];

    for (const file of files) {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      console.log(`⬆️  Nahravám ${file}...`);
      
      try {
        const blob = await put(file, fileBuffer, {
          access: 'public',
          token: BLOB_READ_WRITE_TOKEN,
        });
        
        console.log(`✅ ${file} → ${blob.url}`);
        results.push({
          filename: file,
          url: blob.url,
          success: true
        });
      } catch (error) {
        console.error(`❌ Chyba při nahrávání ${file}:`, error.message);
        results.push({
          filename: file,
          error: error.message,
          success: false
        });
      }
    }

    // Výsledky
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n📊 Výsledky nahrávání:');
    console.log(`✅ Úspěšně nahráno: ${successful.length}`);
    console.log(`❌ Neúspěšné: ${failed.length}`);

    if (successful.length > 0) {
      console.log('\n🔗 URL nahraných screenshotů:');
      successful.forEach(result => {
        console.log(`   ${result.filename}: ${result.url}`);
      });
      
      // Vygeneruj environment variable pro CDN base URL
      const firstUrl = successful[0].url;
      const baseUrl = firstUrl.substring(0, firstUrl.lastIndexOf('/'));
      console.log(`\n📝 Přidej do .env.local:`);
      console.log(`NEXT_PUBLIC_SCREENSHOTS_CDN="${baseUrl}"`);
    }

    if (failed.length > 0) {
      console.log('\n❌ Neúspěšné soubory:');
      failed.forEach(result => {
        console.log(`   ${result.filename}: ${result.error}`);
      });
    }

  } catch (error) {
    console.error('💥 Fatální chyba:', error);
    process.exit(1);
  }
}

// Spusti script
uploadScreenshots(); 