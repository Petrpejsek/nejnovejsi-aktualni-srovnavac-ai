import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Mazání existujících produktů...');
  await prisma.product.deleteMany();

  console.log('📖 Načítání produktů z data/products.json...');
  const productsPath = path.join(process.cwd(), 'data', 'products.json');
  
  if (!fs.existsSync(productsPath)) {
    console.error('❌ Soubor data/products.json neexistuje!');
    process.exit(1);
  }

  const rawData = fs.readFileSync(productsPath, 'utf-8');
  const products = JSON.parse(rawData);

  console.log(`📊 Nalezeno ${products.length} produktů k načtení...`);

  // Function to safely stringify JSON
  function safeStringify(data: any): string {
    if (data === null || data === undefined) return '[]';
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description || null,
          price: product.price || 0,
          category: product.category || null,
          imageUrl: product.imageUrl || null,
          tags: safeStringify(product.tags),
          advantages: safeStringify(product.advantages),
          disadvantages: safeStringify(product.disadvantages),
          detailInfo: product.detailInfo || null,
          pricingInfo: safeStringify(product.pricingInfo),
          videoUrls: safeStringify(product.videoUrls),
          externalUrl: product.externalUrl || null,
          hasTrial: product.hasTrial || false,
        }
      });
      successCount++;
      
      if (successCount % 50 === 0) {
        console.log(`✅ Načteno ${successCount} produktů...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Chyba při načítání produktu ${product.name}:`, error);
      
      if (errorCount > 10) {
        console.error('🛑 Příliš mnoho chyb, ukončuji...');
        break;
      }
    }
  }

  console.log(`🎉 Seed dokončen!`);
  console.log(`✅ Úspěšně načteno: ${successCount} produktů`);
  console.log(`❌ Chyby: ${errorCount} produktů`);
  
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Chyba při seeding:', e);
    process.exit(1);
  }); 