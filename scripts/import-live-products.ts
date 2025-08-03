import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importLiveProducts() {
  console.log('🚀 Začínám import produktů z live serveru...')
  
  try {
    // Načtení JSON souboru
    const jsonPath = path.join(process.cwd(), 'live_products.json')
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Soubor live_products.json nebyl nalezen!')
      return
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8')
    const products = JSON.parse(jsonData)
    
    console.log(`📊 Nalezeno ${products.length} produktů k importu`)
    
    // Smazání existujících produktů
    console.log('🗑️ Mažu existující produkty...')
    await prisma.product.deleteMany()
    
    console.log('📝 Importuji nové produkty...')
    
    let imported = 0
    for (const product of products) {
      try {
        await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price || 0,
            category: product.category || 'other',
            tags: product.tags || [],
            advantages: product.advantages || [],
            disadvantages: product.disadvantages || [],
            imageUrl: product.imageUrl || '',
            websiteUrl: product.websiteUrl || '',
            features: product.features || [],
            pricingModel: product.pricingModel || 'unknown',
            freeTrial: product.freeTrial || false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        imported++
        
        if (imported % 50 === 0) {
          console.log(`✅ Importováno ${imported}/${products.length} produktů...`)
        }
      } catch (error) {
        console.error(`❌ Chyba při importu produktu ${product.name}:`, error)
      }
    }
    
    console.log(`🎉 Import dokončen! Importováno ${imported} produktů ze ${products.length}`)
    
    // Kontrola výsledku
    const totalProducts = await prisma.product.count()
    console.log(`📈 Celkem produktů v databázi: ${totalProducts}`)
    
  } catch (error) {
    console.error('❌ Chyba při importu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importLiveProducts()