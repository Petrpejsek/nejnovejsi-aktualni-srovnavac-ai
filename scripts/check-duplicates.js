import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Funkce pro normalizaci názvu produktu
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Odstraní speciální znaky
    .replace(/\s+/g, ' ') // Nahradí více mezer jednou
    .replace(/\b(the|a|an)\b/g, '') // Odstraní články
    .trim();
}

// Funkce pro normalizaci URL
function normalizeUrl(url) {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .trim();
}

async function checkDuplicates() {
  try {
    console.log('🔍 Hledám duplicitní produkty v databázi...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        externalUrl: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Nalezeno ${products.length} produktů`);

    const duplicateGroups = [];
    const processedProducts = new Set();

    // Kontrola duplicit podle názvu
    console.log('\n🔍 Kontrola duplicit podle názvu...');
    const nameGroups = {};
    
    for (const product of products) {
      if (processedProducts.has(product.id)) continue;
      
      const normalizedName = normalizeProductName(product.name);
      if (!nameGroups[normalizedName]) {
        nameGroups[normalizedName] = [];
      }
      nameGroups[normalizedName].push(product);
    }

    // Najdeme skupiny s více než jedním produktem
    for (const [normalizedName, group] of Object.entries(nameGroups)) {
      if (group.length > 1) {
        duplicateGroups.push({
          type: 'name',
          normalizedKey: normalizedName,
          products: group,
          count: group.length
        });
        group.forEach(p => processedProducts.add(p.id));
      }
    }

    // Kontrola duplicit podle URL
    console.log('\n🔍 Kontrola duplicit podle URL...');
    const urlGroups = {};
    
    for (const product of products) {
      if (processedProducts.has(product.id) || !product.externalUrl) continue;
      
      const normalizedUrl = normalizeUrl(product.externalUrl);
      if (!normalizedUrl) continue;
      
      if (!urlGroups[normalizedUrl]) {
        urlGroups[normalizedUrl] = [];
      }
      urlGroups[normalizedUrl].push(product);
    }

    // Najdeme skupiny s více než jedním produktem
    for (const [normalizedUrl, group] of Object.entries(urlGroups)) {
      if (group.length > 1) {
        duplicateGroups.push({
          type: 'url',
          normalizedKey: normalizedUrl,
          products: group,
          count: group.length
        });
        group.forEach(p => processedProducts.add(p.id));
      }
    }

    // Zobrazíme výsledky
    console.log('\n❌ NALEZENÉ DUPLICITY:');
    console.log('=====================');

    if (duplicateGroups.length === 0) {
      console.log('✅ Žádné duplicity nenalezeny!');
      return;
    }

    let totalDuplicates = 0;
    const productsToDelete = [];

    duplicateGroups.forEach((group, index) => {
      console.log(`\n${index + 1}. Duplicita podle ${group.type === 'name' ? 'NÁZVU' : 'URL'}: "${group.normalizedKey}"`);
      console.log(`   Počet duplicit: ${group.count}`);
      
      // Seřadíme podle data vytvoření (nejstarší zůstane)
      const sortedProducts = group.products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      sortedProducts.forEach((product, productIndex) => {
        const isKeep = productIndex === 0;
        console.log(`   ${isKeep ? '✅ PONECHAT' : '❌ SMAZAT'}: ${product.name}`);
        console.log(`      ID: ${product.id}`);
        console.log(`      URL: ${product.externalUrl || 'N/A'}`);
        console.log(`      Vytvořeno: ${product.createdAt}`);
        console.log(`      Popis: ${product.description?.substring(0, 80)}...`);
        
        if (!isKeep) {
          productsToDelete.push(product);
          totalDuplicates++;
        }
      });
    });

    console.log(`\n📊 STATISTIKY:`);
    console.log(`Celkem produktů: ${products.length}`);
    console.log(`Skupin duplicit: ${duplicateGroups.length}`);
    console.log(`Produktů k odstranění: ${totalDuplicates}`);
    console.log(`Produktů po vyčištění: ${products.length - totalDuplicates}`);

    // Uložíme seznam duplicit
    const duplicateData = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      duplicateGroups: duplicateGroups.length,
      productsToDelete: totalDuplicates,
      duplicateGroups,
      productsToDelete
    };

    fs.writeFileSync('duplicate-products.json', JSON.stringify(duplicateData, null, 2));
    console.log('\n💾 Seznam duplicit uložen do: duplicate-products.json');

    // Nabídneme odstranění
    if (totalDuplicates > 0) {
      console.log('\n⚠️ CHCETE ODSTRANIT DUPLICITY?');
      console.log('Pro odstranění spusťte: node scripts/remove-duplicates.js');
    }

  } catch (error) {
    console.error('❌ Chyba při kontrole duplicit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates(); 