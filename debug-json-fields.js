import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugJsonFields() {
  console.log('🔍 Debugging JSON fields in database...');
  
  try {
    const products = await prisma.product.findMany();
    console.log(`📊 Found ${products.length} products`);
    
    for (const product of products) {
      console.log(`\n--- Product: ${product.name} (${product.id}) ---`);
      
      // Test each JSON field
      const jsonFields = ['tags', 'advantages', 'disadvantages', 'reviews', 'pricingInfo', 'videoUrls'];
      
      for (const fieldName of jsonFields) {
        const fieldValue = product[fieldName];
        console.log(`${fieldName}: ${typeof fieldValue} - ${JSON.stringify(fieldValue)?.substring(0, 100)}...`);
        
        if (fieldValue && typeof fieldValue === 'string') {
          try {
            JSON.parse(fieldValue);
            console.log(`  ✅ ${fieldName}: Valid JSON string`);
          } catch (e) {
            console.log(`  ❌ ${fieldName}: INVALID JSON - ${e.message}`);
            console.log(`     Raw value: ${fieldValue}`);
          }
        } else if (fieldValue && typeof fieldValue === 'object') {
          console.log(`  ✅ ${fieldName}: Already parsed object`);
        } else {
          console.log(`  ⚪ ${fieldName}: Empty or null`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugJsonFields().catch(console.error); 