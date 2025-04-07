import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restoreDatabase(backupFile = 'latest-backup.json') {
  try {
    // Načtení zálohy
    const backupPath = path.join(process.cwd(), 'backups', backupFile);
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Smazání všech současných produktů
    await prisma.product.deleteMany();
    
    // Obnovení produktů ze zálohy
    for (const product of backup.products) {
      await prisma.product.create({
        data: {
          ...product,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }
      });
    }
    
    console.log(`Databáze byla úspěšně obnovena ze zálohy: ${backupFile}`);
  } catch (error) {
    console.error('Chyba při obnovování databáze:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Pokud je zadán název souboru jako argument, použije se ten, jinak latest-backup.json
const backupFile = process.argv[2] || 'latest-backup.json';
restoreDatabase(backupFile); 