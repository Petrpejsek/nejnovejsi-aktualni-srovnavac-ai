import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// This script will fix all products using OpenAI API to translate to proper English
async function completeEnglishTranslation() {
  console.log('Starting COMPLETE English translation with OpenAI...')

  try {
    // Get all products from the database
    const products = await prisma.product.findMany()
    console.log(`Found total of ${products.length} products in database`)
    
    let successCount = 0
    let errorCount = 0
    
    // Process each product
    for (const product of products) {
      try {
        console.log(`Processing product: ${product.name} (ID: ${product.id})`)
        
        // Prepare translations for the product fields
        const translations = await Promise.all([
          translateWithOpenAI(product.description, 'description'),
          translateWithOpenAI(product.tags, 'tags'),
          translateWithOpenAI(product.advantages, 'advantages'),
          translateWithOpenAI(product.disadvantages, 'disadvantages'),
          translateWithOpenAI(product.detailInfo, 'detailInfo'),
          translateWithOpenAI(product.pricingInfo, 'pricingInfo')
        ])
        
        // Create update data object
        const updatedData = {
          description: translations[0],
          tags: translations[1],
          advantages: translations[2],
          disadvantages: translations[3],
          detailInfo: translations[4],
          pricingInfo: translations[5]
        }
        
        // Update the product with OpenAI translated text
        await prisma.product.update({
          where: { id: product.id },
          data: updatedData
        })
        
        console.log(`✅ Fully translated to proper English: ${product.name}`)
        successCount++
      } catch (error) {
        console.error(`❌ Error processing product ${product.name}: ${error}`)
        errorCount++
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log(`\n✨ Complete translation finished! Successfully translated ${successCount} products. Errors: ${errorCount}`)
    
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Translate text using OpenAI API
async function translateWithOpenAI(text: string | null, fieldName: string): Promise<string> {
  if (!text) return ''
  
  try {
    const prompt = `
Translate this text to proper, fluent English. The text may be mixed English and Czech or contain English with grammar errors.
If the text is already in proper English, return it unchanged. Field type: ${fieldName}

Text to translate:
${text}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional translator who converts any text to proper, fluent English.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000
    })
    
    return response.choices[0].message.content || text
  } catch (error) {
    console.error(`❌ Error translating text with OpenAI: ${error}`)
    return text
  }
}

completeEnglishTranslation() 