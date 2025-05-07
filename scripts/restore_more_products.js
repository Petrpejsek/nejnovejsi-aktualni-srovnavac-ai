import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function restoreProducts() {
  try {
    // Načtení dat z JSON souboru
    const backupPath = path.join(__dirname, '..', 'backups', 'latest-backup.json')
    const productsData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))

    console.log(`Načítám ${productsData.length} produktů...`)

    // Vložení produktů do databáze
    for (const product of productsData) {
      try {
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
        console.log(`Vložen produkt: ${product.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Produkt ${product.name} již existuje, přeskakuji...`)
        } else {
          console.error(`Chyba při vkládání produktu ${product.name}:`, error)
        }
      }
    }

    console.log('✅ Obnova produktů dokončena')
  } catch (error) {
    console.error('❌ Chyba při obnově produktů:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreProducts() 