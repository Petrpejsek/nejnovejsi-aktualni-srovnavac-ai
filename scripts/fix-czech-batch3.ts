import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will update Czech products to English - batch 3 (remaining products)
async function fixCzechProductsBatch3() {
  console.log('Starting to fix remaining Czech language products - Batch 3...')

  try {
    // Find all products that might still have Czech descriptions
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { description: { contains: "Česk" } },
          { description: { contains: "čeština" } },
          { description: { contains: "české" } },
          { description: { contains: "nabízí" } },
          { description: { contains: "umožňuje" } },
          { description: { contains: "uživatel" } },
          { description: { contains: "poskytuje" } },
          { description: { contains: "pomocí" } },
          { description: { contains: "používá" } },
          { description: { contains: "zjednodušuje" } },
          { description: { contains: "přístup" } },
          { detailInfo: { contains: "Česk" } },
          { detailInfo: { contains: "čeština" } },
          { detailInfo: { contains: "české" } },
          { advantages: { contains: "Česk" } },
          { advantages: { contains: "čeština" } },
          { advantages: { contains: "Jednoduché" } },
          { advantages: { contains: "Intuitivní" } },
          { advantages: { contains: "Snadné" } },
          { disadvantages: { contains: "Česk" } },
          { disadvantages: { contains: "čeština" } },
          { disadvantages: { contains: "české" } },
          { disadvantages: { contains: "Omezené" } },
          { disadvantages: { contains: "Vyšší" } },
          { pricingInfo: { contains: "Česk" } },
          { pricingInfo: { contains: "čeština" } },
          { pricingInfo: { contains: "české" } },
          { pricingInfo: { contains: "nabízí" } },
          { pricingInfo: { contains: "zdarma" } },
          { pricingInfo: { contains: "měsíčně" } },
          { pricingInfo: { contains: "ročně" } }
        ]
      }
    })

    console.log(`Found ${products.length} products that might still have Czech texts`)

    // For each product with Czech text, translate it to English
    for (const product of products) {
      console.log(`Processing product: ${product.name} (ID: ${product.id})`)
      
      // Here you would normally use a translation API or manually translate
      // For now, let's use simple replacements for common Czech terms
      // This is just a basic solution - for a comprehensive translation,
      // you would need more sophisticated approach
      
      const translatedData = {
        description: translateText(product.description),
        tags: translateText(product.tags),
        advantages: translateText(product.advantages),
        disadvantages: translateText(product.disadvantages),
        detailInfo: translateText(product.detailInfo),
        pricingInfo: translateText(product.pricingInfo)
      }
      
      // Update the product with translated text
      await prisma.product.update({
        where: { id: product.id },
        data: translatedData
      })
      
      console.log(`✅ Updated product to English: ${product.name}`)
    }

    console.log('✨ Batch 3 products updated to English!')
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Simple function to translate common Czech words to English
// Note: This is a very basic approach and won't handle complex translations
function translateText(text: string | null): string | null {
  if (!text) return text
  
  // Simple replacements for common Czech words and phrases
  const translations = {
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
    'platforma': 'platform'
    // Add more translations as needed
  }
  
  let translatedText = text;
  
  // Apply all translations
  Object.entries(translations).forEach(([czech, english]) => {
    // Case insensitive replacement
    const regex = new RegExp(czech, 'gi');
    translatedText = translatedText.replace(regex, english);
  });
  
  return translatedText;
}

fixCzechProductsBatch3() 