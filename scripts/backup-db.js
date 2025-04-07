import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    // Získání všech produktů
    const products = await prisma.product.findMany();
    
    // Vytvoření zálohy
    const backup = {
      timestamp: new Date().toISOString(),
      products: products
    };
    
    // Vytvoření názvu souboru se zálohou
    const backupFileName = `backup-${backup.timestamp.replace(/:/g, '-')}.json`;
    const backupPath = path.join(process.cwd(), 'backups', backupFileName);
    
    // Uložení zálohy
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    // Aktualizace latest-backup.json
    const latestBackupPath = path.join(process.cwd(), 'backups', 'latest-backup.json');
    fs.writeFileSync(latestBackupPath, JSON.stringify(backup, null, 2));
    
    console.log(`Záloha byla úspěšně vytvořena: ${backupFileName}`);
  } catch (error) {
    console.error('Chyba při vytváření zálohy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase(); 