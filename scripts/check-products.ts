import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Pomocné funkce pro kontrolu JSON formátu
function checkJsonFormat(field: string, value: string | null, productId: string, productName: string) {
  if (!value) return

  try {
    // Kontrola, zda je to validní JSON
    JSON.parse(value)
  } catch (error) {
    console.log(`⚠️ Nevalidní JSON formát v poli "${field}" u produktu "${productName}" (${productId}): ${value.substring(0, 50)}...`)
    return false
  }
  
  return true
}

async function checkProducts() {
  try {
    console.log('Kontrola produktů v databázi...')
    
    // Celkový počet produktů
    const totalCount = await prisma.product.count()
    console.log(`Celkový počet produktů: ${totalCount}`)
    
    // Počet produktů podle kategorií
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })
    
    console.log('Počet produktů podle kategorií:')
    categories.forEach(category => {
      console.log(`- ${category.category || 'bez kategorie'}: ${category._count.id} produktů`)
    })
    
    // Kontrola, zda existují produkty bez kategorie
    const productsWithoutCategory = await prisma.product.count({
      where: {
        category: null
      }
    })
    
    if (productsWithoutCategory > 0) {
      console.log(`VAROVÁNÍ: ${productsWithoutCategory} produktů nemá nastavenou kategorii!`)
      
      // Získání detailů
      const details = await prisma.product.findMany({
        where: {
          category: null
        },
        select: {
          id: true,
          name: true,
          externalUrl: true
        }
      })
      
      console.log('Produkty bez kategorie:')
      details.forEach(product => {
        console.log(`- ${product.name} (${product.id}, ${product.externalUrl})`)
      })
    }
    
    // Kontrola duplikátů podle externalUrl
    const urlCounts = await prisma.$queryRaw`
      SELECT "externalUrl", COUNT(*) as count
      FROM "Product"
      WHERE "externalUrl" IS NOT NULL
      GROUP BY "externalUrl"
      HAVING COUNT(*) > 1
    `
    
    if (Array.isArray(urlCounts) && urlCounts.length > 0) {
      console.log('VAROVÁNÍ: Nalezeny duplicitní produkty podle externalUrl:')
      for (const item of urlCounts) {
        console.log(`- ${item.externalUrl}: ${item.count} produktů`)
        
        // Zobrazit detaily o duplikátech
        const duplicates = await prisma.product.findMany({
          where: {
            externalUrl: item.externalUrl as string
          },
          select: {
            id: true,
            name: true,
            category: true,
            createdAt: true
          }
        })
        
        duplicates.forEach(dup => {
          console.log(`  * ${dup.name} (${dup.id}, ${dup.category}, ${dup.createdAt})`)
        })
      }
    } else {
      console.log('✓ Žádné duplicitní produkty podle externalUrl')
    }
    
    // Kontrola formátu JSON polí
    console.log('\nKontrola formátu JSON polí:')
    const productsWithJsonFields = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        tags: true,
        advantages: true,
        disadvantages: true,
        pricingInfo: true,
        videoUrls: true
      }
    })
    
    let invalidFieldsCount = 0
    for (const product of productsWithJsonFields) {
      const fieldsToCheck = [
        { name: 'tags', value: product.tags },
        { name: 'advantages', value: product.advantages },
        { name: 'disadvantages', value: product.disadvantages },
        { name: 'pricingInfo', value: product.pricingInfo },
        { name: 'videoUrls', value: product.videoUrls }
      ]
      
      for (const field of fieldsToCheck) {
        if (field.value && !field.value.trim().startsWith('[') && !field.value.trim().startsWith('{')) {
          console.log(`⚠️ Pole "${field.name}" u produktu "${product.name}" (${product.id}) není v JSON formátu: ${field.value.substring(0, 50)}...`)
          invalidFieldsCount++
        } else if (field.value) {
          const isValid = checkJsonFormat(field.name, field.value, product.id, product.name)
          if (isValid === false) invalidFieldsCount++
        }
      }
    }
    
    if (invalidFieldsCount === 0) {
      console.log('✓ Všechna JSON pole mají správný formát')
    } else {
      console.log(`⚠️ Nalezeno ${invalidFieldsCount} polí s nesprávným JSON formátem`)
    }
    
  } catch (error) {
    console.error('Chyba při kontrole produktů:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Spustit kontrolu produktů
checkProducts() 