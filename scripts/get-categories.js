import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCategories() {
  try {
    // Získání všech unikátních kategorií
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
    });

    console.log('Všechny kategorie v databázi:');
    console.log('='.repeat(50));
    
    const categoryList = [];
    categories.forEach(category => {
      if (category.category) {
        console.log(`${category.category}: ${category._count.id} produktů`);
        categoryList.push(category.category);
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Celkem kategorií: ${categoryList.length}`);
    console.log('\nSeznam kategorií pro tagy:');
    console.log(JSON.stringify(categoryList, null, 2));

  } catch (error) {
    console.error('Chyba při získávání kategorií:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCategories(); 