import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function restoreBackup() {
  try {
    // Načtení zálohy
    const backupPath = path.join(process.cwd(), 'backups', 'latest-backup.json')
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))
    
    console.log(`Načteno ${backupData.length} produktů ze zálohy`)

    // Smazání všech současných produktů
    await prisma.product.deleteMany()
    console.log('Smazány všechny současné produkty')

    // Obnovení produktů ze zálohy
    for (const product of backupData) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          tags: typeof product.tags === 'object' ? JSON.stringify(product.tags) : product.tags,
          advantages: typeof product.advantages === 'object' ? JSON.stringify(product.advantages) : product.advantages,
          disadvantages: typeof product.disadvantages === 'object' ? JSON.stringify(product.disadvantages) : product.disadvantages,
          reviews: product.reviews,
          detailInfo: product.detailInfo,
          pricingInfo: typeof product.pricingInfo === 'object' ? JSON.stringify(product.pricingInfo) : product.pricingInfo,
          videoUrls: typeof product.videoUrls === 'object' ? JSON.stringify(product.videoUrls) : product.videoUrls,
          externalUrl: product.externalUrl,
          hasTrial: product.hasTrial,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }
      })
    }

    console.log('Úspěšně obnoveno', backupData.length, 'produktů')
  } catch (error) {
    console.error('Chyba při obnovování zálohy:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreBackup() 