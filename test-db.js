import { PrismaClient } from '@prisma/client';

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testování databáze...');
    
    // Načtení prvních 5 produktů
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        description: true
      }
    });
    
    console.log('📊 Počet produktů:', products.length);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.id}`);
      console.log(`   Název: ${product.name}`);
      console.log(`   Popis: ${product.description ? product.description.substring(0, 100) + '...' : 'Žádný popis'}`);
      console.log('');
    });
    
    // Test konkrétních ID, která asistent vrací
    const assistantIds = [
      'f3a1b1a2-1c3e-4e7b-b9d3-5c5c4c3e5e6f',
      'c2a3b1d4-2c4e-4c5a-b8e6-8d5c4e5f6e7d'
    ];
    
    console.log('🔍 Testování ID z asistenta...');
    for (const id of assistantIds) {
      const product = await prisma.product.findUnique({
        where: { id }
      });
      
      if (product) {
        console.log(`✅ Nalezen: ${id} - ${product.name}`);
      } else {
        console.log(`❌ Nenalezen: ${id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 