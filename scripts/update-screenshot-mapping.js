import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import funkcí z auto-map-screenshots.js
import { findBestScreenshot } from './auto-map-screenshots.js';

async function getAllProducts() {
  const response = await fetch('http://localhost:3000/api/products?pageSize=500');
  const data = await response.json();
  return data.products;
}

async function updateScreenshotMapping() {
  console.log('🔍 Načítám všechny produkty z API...');
  
  try {
    const products = await getAllProducts();
    console.log(`📦 Nalezeno ${products.length} produktů`);
    
    const newMappings = {};
    let foundCount = 0;
    
    console.log('\n🎯 Hledám screenshoty pro produkty...');
    
    for (const product of products) {
      const result = findBestScreenshot(product.name);
      if (result.screenshot && result.score > 0.7) { // vyšší threshold pro lepší kvalitu
        newMappings[product.name] = result.screenshot;
        foundCount++;
        console.log(`✅ ${product.name} → ${result.screenshot} (${Math.round(result.score * 100)}%)`);
      } else if (result.screenshot && result.score > 0.5) {
        console.log(`⚠️  ${product.name} → ${result.screenshot} (${Math.round(result.score * 100)}%) - NÍZKÁ SHODA`);
      }
    }
    
    console.log(`\n📊 Statistiky:`);
    console.log(`   Celkem produktů: ${products.length}`);
    console.log(`   Nalezeno mapování: ${foundCount}`);
    console.log(`   Pokrytí: ${Math.round((foundCount / products.length) * 100)}%`);
    
    // Načte současné mapování
    const screenshotUtilsPath = path.join(__dirname, '../lib/screenshot-utils.ts');
    let currentContent = fs.readFileSync(screenshotUtilsPath, 'utf8');
    
    // Vytvoří nový kód mapování
    const mappingEntries = Object.entries(newMappings)
      .map(([name, screenshot]) => `  '${name.replace(/'/g, "\\'")}': '${screenshot}'`)
      .join(',\n');
    
    const newMappingCode = `// Mapování názvů produktů na názvy jejich screenshot souborů
const productToScreenshotMap: Record<string, string> = {
${mappingEntries}
};`;
    
    // Najde a nahradí starý kód mapování
    const mappingRegex = /\/\/ Mapování názvů produktů na názvy jejich screenshot souborů[\s\S]*?^};/m;
    
    if (mappingRegex.test(currentContent)) {
      currentContent = currentContent.replace(mappingRegex, newMappingCode);
      console.log('\n💾 Ukládám aktualizované mapování...');
      fs.writeFileSync(screenshotUtilsPath, currentContent);
      console.log('✅ Screenshot mapování bylo úspěšně aktualizováno!');
    } else {
      console.log('❌ Nepodařilo se najít sekci mapování v screenshot-utils.ts');
    }
    
  } catch (error) {
    console.error('❌ Chyba:', error.message);
  }
}

// Spusti pouze pokud je soubor spuštěn přímo
if (import.meta.url === `file://${process.argv[1]}`) {
  updateScreenshotMapping();
}

export { updateScreenshotMapping };
