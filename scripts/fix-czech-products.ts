import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This script will check for Czech language content and update it to English
async function fixCzechProducts() {
  console.log('Starting to check and fix Czech language products...')

  try {
    // Find products that might be in Czech - checking for common Czech characters or words
    const potentialCzechProducts = await prisma.product.findMany({
      where: {
        OR: [
          { description: { contains: 'ě' } },
          { description: { contains: 'š' } },
          { description: { contains: 'č' } },
          { description: { contains: 'ř' } },
          { description: { contains: 'ž' } },
          { description: { contains: 'ý' } },
          { description: { contains: 'á' } },
          { description: { contains: 'í' } },
          { description: { contains: 'é' } },
          { description: { contains: 'ú' } },
          { description: { contains: 'ů' } },
          { description: { contains: 'ň' } },
          { description: { contains: 'ť' } },
          { description: { contains: 'ď' } },
          { tags: { contains: 'ě' } },
          { tags: { contains: 'š' } },
          { tags: { contains: 'č' } },
          { advantages: { contains: 'ě' } },
          { advantages: { contains: 'š' } },
          { advantages: { contains: 'č' } },
          { disadvantages: { contains: 'ě' } },
          { disadvantages: { contains: 'š' } },
          { disadvantages: { contains: 'č' } },
          { detailInfo: { contains: 'ě' } },
          { detailInfo: { contains: 'š' } },
          { detailInfo: { contains: 'č' } },
          { pricingInfo: { contains: 'ě' } },
          { pricingInfo: { contains: 'š' } },
          { pricingInfo: { contains: 'č' } },
        ]
      }
    })

    console.log(`Found ${potentialCzechProducts.length} products that might contain Czech language.`)
    
    // Print details of found products
    if (potentialCzechProducts.length > 0) {
      console.log('\n--- CZECH LANGUAGE PRODUCTS FOUND ---')
      potentialCzechProducts.forEach((product, index) => {
        console.log(`\nProduct #${index + 1}:`)
        console.log(`ID: ${product.id}`)
        console.log(`Name: ${product.name}`)
        console.log(`External URL: ${product.externalUrl}`)
        console.log(`Description: ${product.description?.substring(0, 100)}...`)
      })
      console.log('\n--- END OF CZECH LANGUAGE PRODUCTS ---\n')
    } else {
      console.log('No products with Czech language found.')
    }

    console.log('✨ Check completed!')
  } catch (error) {
    console.error('❌ Error checking products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCzechProducts() 