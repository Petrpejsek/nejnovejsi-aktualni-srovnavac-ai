import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function restore() {
  try {
    // Načtení poslední zálohy
    const backupsDir = path.join(process.cwd(), 'backups')
    const latestBackupPath = path.join(backupsDir, 'latest-backup.json')
    
    // Kontrola existence souboru
    try {
      await fs.access(latestBackupPath)
    } catch (error) {
      console.error('Záložní soubor neexistuje!')
      process.exit(1)
    }

    // Načtení dat ze zálohy
    const backupData = await fs.readFile(latestBackupPath, 'utf8')
    const products = JSON.parse(backupData)
    
    console.log(`Načteno ${products.length} produktů ze zálohy`)

    // Smazání všech současných produktů
    await prisma.product.deleteMany()
    console.log('Současná data byla vymazána')

    // Obnovení produktů ze zálohy
    for (const product of products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          tags: product.tags,
          advantages: product.advantages,
          disadvantages: product.disadvantages,
          reviews: product.reviews,
          detailInfo: product.detailInfo,
          pricingInfo: product.pricingInfo,
          videoUrls: product.videoUrls,
          externalUrl: product.externalUrl,
          hasTrial: product.hasTrial,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }
      })
    }

    console.log('Obnova dat byla úspěšně dokončena')
    
  } catch (error) {
    console.error('Chyba při obnovování dat:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Spuštění obnovy
restore() 