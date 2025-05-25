import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Inicializace Prisma klienta
const prisma = new PrismaClient();

/**
 * Exportuje všechny produkty z databáze do JSON souboru
 * @returns {Promise<string>} Cesta k vytvořenému souboru
 */
export async function exportProductsToFile(): Promise<string> {
  console.log('=== Export produktů: Začátek exportu ===');
  
  try {
    // Získáme všechny produkty z databáze
    console.log('Export produktů: Načítám produkty z databáze...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        tags: true,
        advantages: true,
        disadvantages: true,
        pricingInfo: true,
        videoUrls: true,
        detailInfo: true,
        imageUrl: true,
        externalUrl: true,
        hasTrial: true
      }
    });
    
    console.log(`Export produktů: Načteno ${products.length} produktů z databáze`);
    
    // Zpracujeme produkty, abychom předešli problémům s JSON formátem
    console.log('Export produktů: Zpracovávám produkty...');
    const processedProducts = products.map(product => {
      try {
        // Přeskočíme problematický produkt
        if (product.id === '8b1ad8a1-5afb-40d4-b11d-48c33b606723') {
          console.log(`Export produktů: Speciální zpracování problematického produktu ${product.id}`);
          return {
            ...product,
            tags: [],
            advantages: [],
            disadvantages: [],
            pricingInfo: {},
            videoUrls: []
          };
        }
        
        // Bezpečné parsování JSON polí
        const safelyParse = (field: any, defaultValue: any) => {
          if (!field) return defaultValue;
          if (typeof field !== 'string') return field;
          try {
            return JSON.parse(field);
          } catch (e) {
            console.warn(`Export produktů: Chyba při parsování pole u produktu ${product.id}:`, e);
            return defaultValue;
          }
        };
        
        return {
          ...product,
          tags: safelyParse(product.tags, []),
          advantages: safelyParse(product.advantages, []),
          disadvantages: safelyParse(product.disadvantages, []),
          pricingInfo: safelyParse(product.pricingInfo, {}),
          videoUrls: safelyParse(product.videoUrls, [])
        };
      } catch (error) {
        console.error(`Export produktů: Chyba při zpracování produktu ${product.id}:`, error);
        // Při chybě vrátíme produkt s prázdnými hodnotami
        return {
          ...product,
          tags: [],
          advantages: [],
          disadvantages: [],
          pricingInfo: {},
          videoUrls: []
        };
      }
    });
    
    // Vytvoříme složku data, pokud neexistuje
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      console.log('Export produktů: Vytvářím složku data...');
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Vytvoříme JSON soubor s produkty
    const filePath = path.join(dataDir, 'products.json');
    console.log(`Export produktů: Ukládám produkty do souboru ${filePath}...`);
    
    // Uložíme JSON soubor (pretty-print pro čitelnost)
    fs.writeFileSync(filePath, JSON.stringify(processedProducts, null, 2));
    
    console.log(`Export produktů: Export dokončen, vytvořen soubor ${filePath} s ${processedProducts.length} produkty`);
    return filePath;
  } catch (error) {
    console.error('Export produktů: Chyba při exportu produktů:', error);
    throw error;
  }
} 