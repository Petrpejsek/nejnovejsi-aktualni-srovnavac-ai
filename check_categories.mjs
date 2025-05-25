import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    console.log('🔍 Kontroluji kategorie v databázi...')
    
    // Získáme všechny produkty
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true
      }
    })
    
    console.log(`📊 Celkem produktů: ${products.length}`)
    
    // Spočítáme kategorie
    const categoryCount = {}
    products.forEach(product => {
      const cat = product.category || 'NULL'
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })
    
    console.log('\n📋 Kategorie v databázi (seřazeno podle počtu):')
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`${count.toString().padStart(3)} - ${category}`)
      })
    
    // Zkontrolujeme specificky Healthcare
    const healthcareProducts = products.filter(p => 
      p.category && p.category.toLowerCase().includes('health')
    )
    
    console.log(`\n🏥 Produkty obsahující "health" v kategorii: ${healthcareProducts.length}`)
    healthcareProducts.forEach(p => {
      console.log(`  - ${p.name} (kategorie: ${p.category})`)
    })
    
  } catch (error) {
    console.error('❌ Chyba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories() 