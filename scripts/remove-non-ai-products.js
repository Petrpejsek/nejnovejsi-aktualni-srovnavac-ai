import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// IDs produktů, které jsou skutečně non-AI a měly by být odstraněny
const NON_AI_PRODUCT_IDS = [
  // Gaming engines
  'ad269a85-9a87-425d-a07e-b56e5dd84e3d', // Cocos
  '151fc0f1-7b79-49be-933c-f50358e49d6f', // CRYENGINE
  'fb5666c1-3222-434b-aa8d-00c75fe90ffd', // Defold
  '3ddcb1bb-a0db-4c77-a2ae-2bfa8a77ed72', // PlayCanvas
  '82f7dc79-baf0-4f57-a7e8-45af53a99cce', // Construct 3
  '8f52c499-d62c-4535-b9f2-82ef4755aad6', // GameMaker
  '1030ec2e-b966-4223-b81a-1caccf7843a0', // Stencyl
  'd19a7a05-fcc3-46da-aa2b-0b5e45b511b9', // Manticore Games
  'e2b37f48-0ba5-433b-9741-7d4d1e110135', // Overwolf
  
  // Website builders (non-AI)
  '63aea06d-fd11-47cd-a4a1-e9a12dc0858b', // Mobirise
  '417a5a03-9471-48eb-9a6b-0685375cf142', // Ucraft
  
  // Accounting software (non-AI)
  'b7626905-902f-4bf6-86c8-2a04bae9a131', // Bookipi
  
  // Video editing (non-AI)
  '47fe8e98-6c5b-4831-9765-c2d382d0c437', // Clipchamp
  
  // Email marketing (non-AI)
  '440d8918-57e3-4c21-91fc-c4bec1859c1d', // GetResponse
  
  // Productivity tools (non-AI)
  '0f3be3fa-5099-47f8-9664-c24c6f6bf205', // Trello
];

async function removeNonAiProducts() {
  try {
    console.log('🔍 Kontrolujem produkty k odstranění...');
    
    // Nejprve si zobrazíme produkty, které budeme mazat
    const productsToDelete = await prisma.product.findMany({
      where: {
        id: {
          in: NON_AI_PRODUCT_IDS
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true
      }
    });

    console.log('\n❌ PRODUKTY K ODSTRANĚNÍ:');
    console.log('========================');
    productsToDelete.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Kategorie: ${product.category}`);
      console.log(`   Popis: ${product.description?.substring(0, 100)}...`);
      console.log('');
    });

    if (productsToDelete.length === 0) {
      console.log('✅ Žádné produkty k odstranění nenalezeny.');
      return;
    }

    console.log(`\n⚠️ Připravuji se odstranit ${productsToDelete.length} non-AI produktů...`);
    
    // Zálohujeme produkty před odstraněním
    const backupData = {
      timestamp: new Date().toISOString(),
      deletedProducts: productsToDelete
    };
    
    fs.writeFileSync('deleted-non-ai-products-backup.json', JSON.stringify(backupData, null, 2));
    console.log('💾 Záloha vytvořena: deleted-non-ai-products-backup.json');

    // Odstraníme produkty
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: {
          in: NON_AI_PRODUCT_IDS
        }
      }
    });

    console.log(`\n✅ Úspěšně odstraněno ${deleteResult.count} non-AI produktů z databáze.`);
    
    // Zobrazíme aktuální statistiky
    const remainingCount = await prisma.product.count();
    console.log(`📊 Zbývá produktů v databázi: ${remainingCount}`);

  } catch (error) {
    console.error('❌ Chyba při odstraňování produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeNonAiProducts(); 