import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countProducts() {
  try {
    // Get the total number of products in the database
    const count = await prisma.product.count();
    console.log('Total number of products in database:', count);
    
    // We can also get the count of products by category
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        _all: true
      }
    });
    
    console.log('\nNumber of products by category:');
    categories.forEach(category => {
      console.log(`${category.category}: ${category._count._all}`);
    });
    
  } catch (error) {
    console.error('Error retrieving data from database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
countProducts(); 