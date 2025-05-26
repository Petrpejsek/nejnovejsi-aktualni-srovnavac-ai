import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugProductIds() {
  console.log('🔍 Kontrola ID produktů v databázi...');
  
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
      take: 10
    });
    
    console.log(`📊 Prvních 10 produktů:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ID: ${product.id}`);
    });
    
    const totalCount = await prisma.product.count();
    console.log(`\n📈 Celkem produktů v databázi: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProductIds(); 