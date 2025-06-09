import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  try {
    // Načtení zálohy
    const backupPath = path.join(process.cwd(), 'backups', 'backup-2025-02-16T17-45-55-295Z.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Vymazání existujících dat
    await prisma.product.deleteMany();

    // Vytvoření nových produktů
    for (const product of backupData) {
      await prisma.product.create({
        data: {
          id: uuidv4(),
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          tags: product.tags,
          advantages: product.advantages,
          disadvantages: product.disadvantages,
          detailInfo: product.detailInfo,
          pricingInfo: product.pricingInfo,
          videoUrls: product.videoUrls,
          externalUrl: product.externalUrl,
          hasTrial: product.hasTrial,
          updatedAt: new Date()
        }
      });
    }

    console.log('Data byla úspěšně obnovena');
  } catch (error) {
    console.error('Chyba při obnovování dat:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 