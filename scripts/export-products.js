import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Skript pro export všech produktů do JSON souboru pro Assistants API
 * Tento soubor můžeme použít jednorázově pro vytvoření souboru s daty produktů
 */
async function exportProducts() {
  try {
    console.log('Začínám export produktů...');
    
    // Načtení všech produktů z databáze
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
        detailInfo: true
      }
    });
    
    console.log(`Načteno ${products.length} produktů z databáze`);
    
    // Zpracování produktů - převedení stringů na objekty
    const processedProducts = products.map(product => {
      try {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
          advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
          disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages,
          pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo,
          videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls,
          detailInfo: product.detailInfo
        };
      } catch (error) {
        // Pokud dojde k chybě při parsování, uložíme základní data s prázdnými poli
        console.error(`Chyba při zpracování produktu ${product.id}: ${error.message}`);
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          tags: [],
          advantages: [],
          disadvantages: [],
          pricingInfo: {},
          videoUrls: [],
          detailInfo: product.detailInfo
        };
      }
    });
    
    // Vytvoření složky pro data, pokud neexistuje
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    // Uložení do JSON souboru
    const outputPath = path.join(dataDir, 'products.json');
    fs.writeFileSync(
      outputPath, 
      JSON.stringify({ products: processedProducts }, null, 2)
    );
    
    console.log(`Produkty byly exportovány do: ${outputPath}`);
    console.log(`Celkový počet exportovaných produktů: ${processedProducts.length}`);
    
  } catch (error) {
    console.error('Chyba při exportu produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Spuštění exportu
exportProducts(); 