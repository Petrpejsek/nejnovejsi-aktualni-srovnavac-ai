import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function backup() {
  try {
    // Kontrola poslední zálohy
    const backupsDir = path.join(process.cwd(), 'backups')
    const files = await fs.readdir(backupsDir)
    const lastBackup = files
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse()[0]

    if (lastBackup) {
      const lastBackupTime = new Date(lastBackup.replace('backup-', '').replace('.json', '').replace(/-/g, ':'))
      const hoursSinceLastBackup = (Date.now() - lastBackupTime.getTime()) / (1000 * 60 * 60)

      // Pokud je poslední záloha mladší než 12 hodin, přeskočíme
      if (hoursSinceLastBackup < 12) {
        console.log('Poslední záloha je mladší než 12 hodin, přeskakuji...')
        return
      }
    }

    // Načtení všech produktů z databáze
    const products = await prisma.product.findMany()
    
    // Vytvoření timestampu pro název souboru
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `backup-${timestamp}.json`
    const latestBackupFileName = 'latest-backup.json'
    
    // Cesta k záložním souborům
    const backupPath = path.join(backupsDir, backupFileName)
    const latestBackupPath = path.join(backupsDir, latestBackupFileName)
    
    // Uložení zálohy s timestampem
    await fs.writeFile(
      backupPath,
      JSON.stringify(products, null, 2),
      'utf8'
    )
    
    // Uložení zálohy jako latest
    await fs.writeFile(
      latestBackupPath,
      JSON.stringify(products, null, 2),
      'utf8'
    )
    
    // Ponecháme pouze posledních 5 záloh pro úsporu místa
    const backupFiles = files
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse()
    
    // Smazání starých záloh
    for (const file of backupFiles.slice(5)) {
      await fs.unlink(path.join(backupsDir, file))
    }
    
    console.log(`Záloha vytvořena: ${backupFileName}`)
    console.log(`Počet produktů v záloze: ${products.length}`)
    console.log('Další záloha bude možná za 12 hodin')
    
  } catch (error) {
    console.error('Chyba při vytváření zálohy:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Spuštění zálohy
backup() 