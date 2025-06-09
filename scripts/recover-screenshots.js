import { promises as fs } from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Načteme ENV proměnné
config();

async function findAllScreenshots() {
  const screenshots = new Map();
  
  console.log('🔍 Hledám existující screenshoty...\n');
  
  // 1. Hledáme v ./screenshots/
  try {
    const files = await fs.readdir('./screenshots');
    for (const file of files) {
      if (file.endsWith('.png')) {
        const productName = file.replace('_homepage.png', '').replace(/_/g, ' ');
        screenshots.set(productName.toLowerCase(), {
          path: `./screenshots/${file}`,
          source: 'screenshots'
        });
        console.log(`✅ Screenshots: ${file}`);
      }
    }
  } catch (e) {
    console.log('📁 Složka ./screenshots/ neexistuje');
  }
  
  // 2. Hledáme v ./admin/products/*/images/
  try {
    const adminDirs = await fs.readdir('./admin/products');
    for (const dir of adminDirs) {
      const imagesPath = `./admin/products/${dir}/images`;
      try {
        const imageFiles = await fs.readdir(imagesPath);
        for (const file of imageFiles) {
          if (file.endsWith('.png')) {
            const productName = dir.replace(/-/g, ' ');
            screenshots.set(productName.toLowerCase(), {
              path: `${imagesPath}/${file}`,
              source: 'admin'
            });
            console.log(`✅ Admin: ${dir}/${file}`);
          }
        }
      } catch (e) {
        // Složka images neexistuje pro tento produkt
      }
    }
  } catch (e) {
    console.log('📁 Složka ./admin/products/ neexistuje');
  }
  
  // 3. Hledáme v ./public/images/
  try {
    const files = await fs.readdir('./public/images');
    for (const file of files) {
      if (file.endsWith('.png')) {
        const productName = file.replace('.png', '').replace(/-/g, ' ');
        screenshots.set(productName.toLowerCase(), {
          path: `./public/images/${file}`,
          source: 'public'
        });
        console.log(`✅ Public: ${file}`);
      }
    }
  } catch (e) {
    console.log('📁 Složka ./public/images/ neexistuje');
  }
  
  return screenshots;
}

async function getProductsFromFile() {
  console.log('\n📊 Načítám produkty ze souboru...');
  const productsData = await fs.readFile('public/products_extended.json', 'utf8');
  const products = JSON.parse(productsData);
  console.log(`📄 Nalezeno ${products.length} produktů`);
  return products;
}

async function generateScreenshotFilename(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_homepage.png`;
}

async function copyScreenshot(sourcePath, targetPath) {
  try {
    await fs.copyFile(sourcePath, targetPath);
    return true;
  } catch (error) {
    console.log(`❌ Chyba při kopírování: ${error.message}`);
    return false;
  }
}

async function recoverScreenshots() {
  console.log('🎯 Spouštím recovery screenshotů...\n');
  
  try {
    // 1. Najdeme všechny existující screenshoty
    const existingScreenshots = await findAllScreenshots();
    console.log(`\n📈 Nalezeno ${existingScreenshots.size} existujících screenshotů\n`);
    
    // 2. Načteme produkty
    const products = await getProductsFromFile();
    
    // 3. Vytvoříme cílovou složku
    await fs.mkdir('public/screenshots', { recursive: true });
    
    // 4. Projdeme produkty a pokusíme se najít screenshoty
    let recoveredCount = 0;
    let missingCount = 0;
    const missingProducts = [];
    
    console.log('🔄 Obnovuji screenshoty...\n');
    
    for (let i = 0; i < Math.min(products.length, 100); i++) {
      const product = products[i];
      const targetFilename = await generateScreenshotFilename(product.name);
      const targetPath = `public/screenshots/${targetFilename}`;
      
      // Zkontrolujeme, jestli už screenshot existuje
      try {
        await fs.access(targetPath);
        console.log(`⏭️  ${i + 1}/${products.length}: ${product.name} - už existuje`);
        continue;
      } catch (e) {
        // Screenshot neexistuje, pokusíme se ho najít
      }
      
      // Hledáme podle různých variant názvu
      const searchNames = [
        product.name.toLowerCase(),
        product.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        product.name.toLowerCase().replace(/[^a-z0-9]/g, ' '),
        product.name.toLowerCase().replace(/-/g, ' '),
        product.name.toLowerCase().replace(/_/g, ' ')
      ];
      
      let found = false;
      for (const searchName of searchNames) {
        if (existingScreenshots.has(searchName)) {
          const sourceInfo = existingScreenshots.get(searchName);
          console.log(`🔄 ${i + 1}/${products.length}: ${product.name} - kopíruji z ${sourceInfo.source}`);
          
          const success = await copyScreenshot(sourceInfo.path, targetPath);
          if (success) {
            recoveredCount++;
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        console.log(`❌ ${i + 1}/${products.length}: ${product.name} - chybí screenshot`);
        missingCount++;
        missingProducts.push({
          name: product.name,
          url: product.url,
          filename: targetFilename
        });
      }
    }
    
    // 5. Výsledky
    console.log('\n📊 VÝSLEDKY:');
    console.log(`✅ Obnoveno: ${recoveredCount} screenshotů`);
    console.log(`❌ Chybí: ${missingCount} screenshotů`);
    
    if (missingProducts.length > 0) {
      console.log('\n📝 Seznam chybějících screenshotů:');
      const missingList = missingProducts.map(p => `${p.name} (${p.url})`).join('\n');
      await fs.writeFile('missing-screenshots.txt', missingList);
      console.log('📁 Seznam uložen do: missing-screenshots.txt');
    }
    
    console.log('\n✅ Recovery dokončen!');
    
  } catch (error) {
    console.error('❌ Chyba při recovery:', error);
  }
}

// Spustíme recovery
recoverScreenshots(); 