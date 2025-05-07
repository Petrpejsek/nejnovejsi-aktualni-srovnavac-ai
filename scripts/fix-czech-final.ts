import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will find and fix all remaining Czech language products
async function fixRemainingCzechProducts() {
  console.log('Starting final Czech language cleanup...')

  try {
    // Get all products from the database
    const allProducts = await prisma.product.findMany()
    console.log(`Found total of ${allProducts.length} products in database`)

    let updatedCount = 0
    
    // Process each product
    for (const product of allProducts) {
      let needsUpdate = false
      const updatedData: Record<string, string> = {}
      
      // Check all text fields for Czech characters
      const textFields = ['description', 'tags', 'advantages', 'disadvantages', 'detailInfo', 'pricingInfo']
      
      for (const field of textFields) {
        const text = product[field as keyof typeof product] as string | null
        
        if (text && containsCzechText(text)) {
          updatedData[field] = translateText(text)
          needsUpdate = true
        }
      }
      
      // Update product if Czech text was found
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updatedData
        })
        updatedCount++
        console.log(`✅ Updated product to English: ${product.name} (ID: ${product.id})`)
      }
    }
    
    console.log(`✨ Final cleanup complete! Updated ${updatedCount} products to English.`)
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if text contains Czech characters or common Czech words
function containsCzechText(text: string): boolean {
  // Czech characters
  const czechChars = /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/
  
  // Common Czech words (lowercase)
  const czechWords = [
    'nabízí', 'umožňuje', 'uživatel', 'uživatelé', 'uživatelům', 'poskytuje', 
    'pomocí', 'používá', 'zjednodušuje', 'přístup', 'jednoduché', 'intuitivní', 
    'snadné', 'omezené', 'vyšší', 'zdarma', 'měsíčně', 'ročně', 'aplikace', 
    'nástroj', 'nástroje', 'funkce', 'možnosti', 'služba', 'služby', 'cena',
    'platforma', 'vytvoření', 'generování', 'analýza', 'včetně', 'během',
    'pomáhá', 'umělé', 'inteligence', 'zpracování', 'automatické', 'jednoduchá',
    'rozhraní', 'nabídka', 'každý', 'který', 'která', 'které', 'kteří', 'velmi',
    'kvalitní', 'dostupné', 'využívá', 'nabízejí', 'potřeby', 'vhodné', 'podle',
    'mezi', 'jako', 'také', 'nyní', 'bezplatná', 'placená', 'verze', 'dostupná'
  ]
  
  // Check for Czech characters
  if (czechChars.test(text)) {
    return true
  }
  
  // Check for Czech words (case insensitive)
  const lowerText = text.toLowerCase()
  for (const word of czechWords) {
    if (lowerText.includes(word)) {
      return true
    }
  }
  
  return false
}

// Translate Czech text to English
function translateText(text: string): string {
  if (!text) return text
  
  // Extensive dictionary of Czech to English translations
  const translations: Record<string, string> = {
    // Common Czech words
    'nabízí': 'offers',
    'umožňuje': 'enables',
    'uživatel': 'user',
    'uživatelé': 'users',
    'uživatelům': 'users',
    'poskytuje': 'provides',
    'pomocí': 'using',
    'používá': 'uses',
    'zjednodušuje': 'simplifies',
    'přístup': 'access',
    'jednoduché': 'simple',
    'intuitivní': 'intuitive',
    'snadné': 'easy',
    'omezené': 'limited',
    'vyšší': 'higher',
    'zdarma': 'free',
    'měsíčně': 'monthly',
    'ročně': 'yearly',
    'český': 'Czech',
    'česká': 'Czech',
    'české': 'Czech',
    'čeština': 'Czech language',
    'Česká republika': 'Czech Republic',
    'aplikace': 'application',
    'nástroj': 'tool',
    'nástroje': 'tools',
    'funkce': 'features',
    'možnosti': 'options',
    'služba': 'service',
    'služby': 'services',
    'cena': 'price',
    'platforma': 'platform',
    'vytvoření': 'creation',
    'generování': 'generation',
    'analýza': 'analysis',
    'včetně': 'including',
    'během': 'during',
    'pomáhá': 'helps',
    'umělé': 'artificial',
    'inteligence': 'intelligence',
    'zpracování': 'processing',
    'automatické': 'automatic',
    'jednoduchá': 'simple',
    'rozhraní': 'interface',
    'nabídka': 'offer',
    'každý': 'every',
    'který': 'which',
    'která': 'which',
    'které': 'which',
    'kteří': 'who',
    'velmi': 'very',
    'kvalitní': 'quality',
    'dostupné': 'available',
    'využívá': 'utilizes',
    'nabízejí': 'offer',
    'potřeby': 'needs',
    'vhodné': 'suitable',
    'podle': 'according to',
    'mezi': 'between',
    'jako': 'as',
    'také': 'also',
    'nyní': 'now',
    'bezplatná': 'free',
    'placená': 'paid',
    'verze': 'version',
    'dostupná': 'available',
    
    // Czech characters
    'á': 'a',
    'č': 'c',
    'ď': 'd',
    'é': 'e',
    'ě': 'e',
    'í': 'i',
    'ň': 'n',
    'ó': 'o',
    'ř': 'r',
    'š': 's',
    'ť': 't',
    'ú': 'u',
    'ů': 'u',
    'ý': 'y',
    'ž': 'z',
    'Á': 'A',
    'Č': 'C',
    'Ď': 'D',
    'É': 'E',
    'Ě': 'E',
    'Í': 'I',
    'Ň': 'N',
    'Ó': 'O',
    'Ř': 'R',
    'Š': 'S',
    'Ť': 'T',
    'Ú': 'U',
    'Ů': 'U',
    'Ý': 'Y',
    'Ž': 'Z'
  }
  
  let translatedText = text;
  
  // Replace Czech characters and words
  Object.entries(translations).forEach(([czech, english]) => {
    // Case insensitive replacement of whole words
    if (czech.length > 1) {
      const regex = new RegExp(`\\b${czech}\\b`, 'gi');
      translatedText = translatedText.replace(regex, english);
    } else {
      // Direct replacement for single characters
      translatedText = translatedText.replace(new RegExp(czech, 'g'), english);
    }
  });
  
  return translatedText;
}

fixRemainingCzechProducts() 