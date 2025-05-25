import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testYourIds() {
  try {
    console.log('🔍 Testování ID z vašeho přímého testu asistenta...');
    
    const yourIds = [
      '1ba08a5e-0982-4248-bd3b-df024efdd7a2', // WeGrow.ai
      'ecc7b945-68d9-42cc-819a-c66bf6ff4b58', // TapClicks
      'a59ce69d-012e-49f9-b9fd-11e85002a3ff'  // Albert.ai
    ];
    
    console.log('Hledám produkty s ID:', yourIds);
    
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: yourIds
        }
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    });
    
    console.log('📊 Výsledky:');
    console.log(`Nalezeno ${products.length} z ${yourIds.length} produktů`);
    
    yourIds.forEach(id => {
      const found = products.find(p => p.id === id);
      if (found) {
        console.log(`✅ ${id} - ${found.name}`);
      } else {
        console.log(`❌ ${id} - NEEXISTUJE v databázi`);
      }
    });
    
    if (products.length === 0) {
      console.log('🚨 PROBLÉM: Žádné z ID z vašeho testu neexistuje v databázi!');
      console.log('🚨 To znamená, že asistent má zastaralá data nebo špatnou přílohu.');
    }
    
  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testYourIds(); 