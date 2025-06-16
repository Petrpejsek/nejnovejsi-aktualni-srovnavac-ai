import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    console.log('🔍 Načítám seznam duplicit...');
    
    // Načteme seznam duplicit
    if (!fs.existsSync('duplicate-products.json')) {
      console.log('❌ Soubor duplicate-products.json nenalezen. Nejprve spusťte: node scripts/check-duplicates.js');
      return;
    }

    const duplicateData = JSON.parse(fs.readFileSync('duplicate-products.json', 'utf8'));
    const productsToDelete = duplicateData.productsToDelete;

    if (!productsToDelete || productsToDelete.length === 0) {
      console.log('✅ Žádné duplicity k odstranění!');
      return;
    }

    console.log(`📊 Připravuji se odstranit ${productsToDelete.length} duplicitních produktů...`);

    // Zobrazíme produkty, které budeme mazat
    console.log('\n❌ PRODUKTY K ODSTRANĚNÍ:');
    console.log('========================');
    productsToDelete.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   URL: ${product.externalUrl || 'N/A'}`);
      console.log(`   Vytvořeno: ${product.createdAt}`);
      console.log('');
    });

    // Vytvoříme zálohu před odstraněním
    const backupData = {
      timestamp: new Date().toISOString(),
      deletedProducts: productsToDelete,
      originalDuplicateData: duplicateData
    };

    fs.writeFileSync('deleted-duplicates-backup.json', JSON.stringify(backupData, null, 2));
    console.log('💾 Záloha vytvořena: deleted-duplicates-backup.json');

    // Extrahujeme IDs produktů k odstranění
    const idsToDelete = productsToDelete.map(p => p.id);

    console.log('\n🗑️ Odstraňuji duplicitní produkty...');

    // Odstraníme produkty
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });

    console.log(`\n✅ Úspěšně odstraněno ${deleteResult.count} duplicitních produktů!`);

    // Zobrazíme aktuální statistiky
    const remainingCount = await prisma.product.count();
    console.log(`📊 Zbývá produktů v databázi: ${remainingCount}`);

    // Smazeme soubor s duplicity
    fs.unlinkSync('duplicate-products.json');
    console.log('🧹 Soubor duplicate-products.json byl odstraněn');

    console.log('\n🎉 Databáze byla úspěšně vyčištěna od duplicit!');

  } catch (error) {
    console.error('❌ Chyba při odstraňování duplicit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicates(); 