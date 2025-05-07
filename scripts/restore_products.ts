import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function restoreProducts() {
  try {
    // Načtení dat z JSON souboru
    const backupPath = path.join(process.cwd(), 'products_backup.json')
    const productsData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))

    console.log(`Načítám ${productsData.length} produktů...`)

    // Vložení produktů do databáze
    for (const product of productsData) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          tags: JSON.stringify(product.tags || []),
          advantages: JSON.stringify(product.advantages || []),
          disadvantages: JSON.stringify(product.disadvantages || []),
          reviews: product.reviews,
          detailInfo: product.detailInfo || '',
          pricingInfo: typeof product.pricingInfo === 'object' ? JSON.stringify(product.pricingInfo) : product.pricingInfo,
          videoUrls: JSON.stringify(product.videoUrls || []),
          externalUrl: product.externalUrl || '',
          hasTrial: Boolean(product.hasTrial),
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }
      })
      console.log(`Vložen produkt: ${product.name}`)
    }

    console.log('✅ Obnova produktů dokončena')
  } catch (error) {
    console.error('❌ Chyba při obnově produktů:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreProducts() 