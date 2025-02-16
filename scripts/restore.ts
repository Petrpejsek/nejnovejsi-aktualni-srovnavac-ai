import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function restore() {
  try {
    // Načtení poslední zálohy
    const backupPath = path.join(process.cwd(), 'backups', 'latest-backup.json')
    const backupData = await fs.readFile(backupPath, 'utf8')
    const products = JSON.parse(backupData)

    // Kontrola počtu produktů
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error('Záloha neobsahuje žádné produkty!')
    }

    console.log(`Načteno ${products.length} produktů ze zálohy`)

    // Vymazání současných dat
    await prisma.product.deleteMany()
    console.log('Současná data vymazána')

    // Obnovení produktů ze zálohy
    for (const product of products) {
      // Odstranění ID a časových údajů pro čistý import
      const { id, createdAt, updatedAt, ...productData } = product
      
      await prisma.product.create({
        data: productData
      })
    }

    console.log(`Úspěšně obnoveno ${products.length} produktů`)

  } catch (error) {
    console.error('Chyba při obnově ze zálohy:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Spuštění obnovy
restore() 