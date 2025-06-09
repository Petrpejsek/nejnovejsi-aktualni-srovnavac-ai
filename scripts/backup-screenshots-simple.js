import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

async function createScreenshot(url, filename) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Nastavíme timeout a navigujeme
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Počkáme, aby se stránka načetla
    await page.waitForTimeout(3000);
    
    // Vytvoříme screenshot
    const screenshotPath = path.join('public/screenshots', filename);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false,
      type: 'png'
    });
    
    console.log(`✅ Screenshot vytvořen: ${filename}`);
    return true;
    
  } catch (error) {
    console.log(`❌ Chyba při screenshotu ${filename}: ${error.message}`);
    return false;
  } finally {
    await browser.close();
  }
}

async function createBackupZip() {
  console.log('📦 Vytvářím backup ZIP...');
  
  const output = createWriteStream('screenshots-backup.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`✅ Backup vytvořen: screenshots-backup.zip (${archive.pointer()} bytes)`);
      resolve();
    });
    
    archive.on('error', reject);
    archive.pipe(output);
    
    // Přidáme všechny PNG soubory ze screenshots složky
    archive.glob('*.png', { cwd: 'public/screenshots' });
    archive.finalize();
  });
}

async function generateScreenshotFilename(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_homepage.png`;
}

async function backupScreenshots() {
  console.log('🎯 Spouštím backup screenshotů...\n');
  
  try {
    // 1. Načteme produkty ze souboru
    console.log('📊 Načítám produkty ze souboru...');
    const productsData = await fs.readFile('public/products_extended.json', 'utf8');
    const products = JSON.parse(productsData);
    
    console.log(`📄 Nalezeno ${products.length} produktů\n`);
    
    // 2. Vytvoříme složku pro screenshoty pokud neexistuje
    await fs.mkdir('public/screenshots', { recursive: true });
    
    // 3. Vytvoříme screenshoty pro první 30 produktů
    let successCount = 0;
    const maxScreenshots = 30;
    
    for (let i = 0; i < Math.min(products.length, maxScreenshots); i++) {
      const product = products[i];
      
      console.log(`🌐 ${i + 1}/${Math.min(products.length, maxScreenshots)}: ${product.name}`);
      
      try {
        const filename = await generateScreenshotFilename(product.name);
        const success = await createScreenshot(product.url, filename);
        
        if (success) {
          successCount++;
        }
        
        // Pauza mezi screenshoty
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`❌ Chyba u ${product.name}: ${error.message}`);
      }
    }
    
    console.log(`\n🎯 Vytvořeno ${successCount} screenshotů z ${maxScreenshots}`);
    
    // 4. Vytvoříme backup ZIP
    await createBackupZip();
    
    // 5. Vytvoříme restore script
    const restoreScript = `#!/bin/bash
# Script pro obnovení screenshotů z backup ZIP
echo "🔄 Obnovuji screenshoty z backup..."
unzip -o screenshots-backup.zip -d public/screenshots/
echo "✅ Screenshoty obnoveny!"
`;
    
    await fs.writeFile('restore-screenshots.sh', restoreScript);
    await fs.chmod('restore-screenshots.sh', '755');
    
    console.log('\n✅ Backup dokončen!');
    console.log('📁 Soubory vytvořeny:');
    console.log('   - screenshots-backup.zip (záloha screenshotů)');
    console.log('   - restore-screenshots.sh (script pro obnovení)');
    console.log('\n💡 Pro obnovení screenshotů spusťte: ./restore-screenshots.sh');
    
  } catch (error) {
    console.error('❌ Chyba při backup:', error);
  }
}

// Spustíme backup
backupScreenshots(); 