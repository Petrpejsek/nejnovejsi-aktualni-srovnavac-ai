import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Funkce pro kontrolu konkrétního produktu podle ID
async function checkProduct(productId: string) {
  console.log(`Kontroluji produkt s ID: ${productId}`)

  try {
    // Načtení produktu z databáze
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.log(`❌ Produkt s ID ${productId} nebyl nalezen v databázi`)
      return
    }

    // Výpis detailů produktu
    console.log('=========== DETAILY PRODUKTU ===========')
    console.log(`Název: ${product.name}`)
    console.log(`External URL: ${product.externalUrl}`)
    
    // Kontrola textových polí
    console.log('\n--- Popis ---')
    console.log(product.description)
    
    console.log('\n--- Tagy ---')
    console.log(product.tags)
    
    console.log('\n--- Výhody ---')
    console.log(product.advantages)
    
    console.log('\n--- Nevýhody ---')
    console.log(product.disadvantages)
    
    console.log('\n--- Detailní informace ---')
    console.log(product.detailInfo)
    
    console.log('\n--- Cenové informace ---')
    console.log(product.pricingInfo)
    
    console.log('======================================')

    // Kontrola češtiny v textech
    checkForCzechText(product)

  } catch (error) {
    console.error('❌ Chyba při kontrole produktu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Funkce pro kontrolu češtiny v textech produktu
function checkForCzechText(product: any) {
  const czechChars = /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/
  
  // Kontrola textových polí
  const textFields = ['description', 'tags', 'advantages', 'disadvantages', 'detailInfo', 'pricingInfo']
  let hasCzech = false
  
  console.log('\n--- Kontrola českých znaků ---')
  
  for (const field of textFields) {
    const text = product[field]
    if (text && czechChars.test(text)) {
      console.log(`❌ Pole "${field}" obsahuje české znaky: ${text.match(czechChars)?.join(', ')}`)
      hasCzech = true
    }
  }
  
  if (!hasCzech) {
    console.log('✅ Produkt neobsahuje žádné české znaky')
  } else {
    console.log('⚠️ Produkt stále obsahuje české znaky, potřeba dalšího překladu')
  }
}

// Spuštění kontroly s konkrétním ID
checkProduct('03e6d9d6-f2f6-4d8d-8cf9-05fa56076a9d') 