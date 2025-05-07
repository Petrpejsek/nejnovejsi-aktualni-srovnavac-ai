import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Převod řetězce na JSON formát
function convertToJsonFormat(field: string, value: string | null): string | null {
  if (!value) return null
  
  try {
    // Zkusíme parsovat, jestli už náhodou není v JSON formátu
    JSON.parse(value)
    return value // Pokud je to validní JSON, vrátíme původní hodnotu
  } catch (error) {
    // Není to JSON, provedeme konverzi
    
    // Pro pole (arrays)
    if (field === 'tags' || field === 'advantages' || field === 'disadvantages' || field === 'videoUrls') {
      // Rozdělíme podle čárky a vytvoříme pole
      const items = value.split(',').map(item => item.trim())
      return JSON.stringify(items)
    }
    
    // Pro objekty (pricingInfo)
    if (field === 'pricingInfo') {
      // Pro jednoduchost vytvoříme objekt s popisem
      return JSON.stringify({ 
        description: value.trim() 
      })
    }
    
    // Defaultní chování
    return JSON.stringify(value.trim())
  }
}

async function fixJsonFormat() {
  try {
    console.log('Začínám opravovat formát JSON polí...')
    
    // Získat všechny produkty
    const products = await prisma.product.findMany()
    console.log(`Nalezeno celkem ${products.length} produktů k kontrole`)
    
    let updatedCount = 0
    let processedCount = 0
    
    // Projít každý produkt
    for (const product of products) {
      processedCount++
      
      if (processedCount % 10 === 0) {
        console.log(`Zpracováno ${processedCount}/${products.length} produktů...`)
      }
      
      const fieldsToUpdate: any = {}
      let needsUpdate = false
      
      // Pole, která chceme zkontrolovat
      const fieldsToCheck = [
        { name: 'tags', value: product.tags },
        { name: 'advantages', value: product.advantages },
        { name: 'disadvantages', value: product.disadvantages },
        { name: 'pricingInfo', value: product.pricingInfo },
        { name: 'videoUrls', value: product.videoUrls }
      ]
      
      // Zkontrolovat každé pole
      for (const field of fieldsToCheck) {
        if (!field.value) continue
        
        // Kontrola, zda je pole v JSON formátu
        let isValidJson = true
        try {
          JSON.parse(field.value)
        } catch (error) {
          isValidJson = false
        }
        
        // Pokud není v JSON formátu, převedeme ho
        if (!isValidJson) {
          const jsonValue = convertToJsonFormat(field.name, field.value)
          fieldsToUpdate[field.name] = jsonValue
          needsUpdate = true
        }
      }
      
      // Aktualizovat produkt, pokud je potřeba
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: fieldsToUpdate
        })
        updatedCount++
        console.log(`✅ Opraven produkt ${product.name} (ID: ${product.id})`)
      }
    }
    
    console.log(`\nOprava dokončena! Aktualizováno ${updatedCount} z ${products.length} produktů.`)
    
  } catch (error) {
    console.error('Chyba při opravě JSON formátu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Spustit opravu JSON formátu
fixJsonFormat() 