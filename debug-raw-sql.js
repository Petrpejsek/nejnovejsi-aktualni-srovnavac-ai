import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugRawSql() {
  console.log('🔍 Debugging with raw SQL...');
  
  try {
    // Use raw SQL to bypass JSON parsing
    const products = await prisma.$queryRaw`
      SELECT id, name, tags, advantages, disadvantages, reviews, "pricingInfo", "videoUrls"
      FROM "Product"
      LIMIT 10
    `;
    
    console.log(`📊 Found ${products.length} products`);
    
    for (const product of products) {
      console.log(`\n--- Product: ${product.name} (${product.id}) ---`);
      
      // Test each JSON field
      const jsonFields = ['tags', 'advantages', 'disadvantages', 'reviews', 'pricingInfo', 'videoUrls'];
      
      for (const fieldName of jsonFields) {
        const fieldValue = product[fieldName];
        console.log(`${fieldName}: ${typeof fieldValue} - ${String(fieldValue)?.substring(0, 100)}...`);
        
        if (fieldValue && typeof fieldValue === 'string') {
          try {
            JSON.parse(fieldValue);
            console.log(`  ✅ ${fieldName}: Valid JSON string`);
          } catch (e) {
            console.log(`  ❌ ${fieldName}: INVALID JSON - ${e.message}`);
            console.log(`     Raw value: "${fieldValue}"`);
          }
        } else if (fieldValue && typeof fieldValue === 'object') {
          console.log(`  ✅ ${fieldName}: Object`);
        } else if (fieldValue === null) {
          console.log(`  ⚪ ${fieldName}: NULL`);
        } else {
          console.log(`  ❓ ${fieldName}: Unknown type`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRawSql().catch(console.error); 