import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findEmailTools() {
  console.log('📧 Hledám email marketing nástroje v databázi...');
  
  try {
    const emailTools = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'email', mode: 'insensitive' } },
          { name: { contains: 'mail', mode: 'insensitive' } },
          { description: { contains: 'email', mode: 'insensitive' } },
          { description: { contains: 'mail', mode: 'insensitive' } },
          { category: { contains: 'mail', mode: 'insensitive' } }
        ]
      },
      select: { 
        id: true, 
        name: true, 
        category: true, 
        description: true 
      }
    });
    
    console.log(`📊 Nalezeno ${emailTools.length} email marketing nástrojů:`);
    if (emailTools.length === 0) {
      console.log('❌ Žádné email marketing nástroje nenalezeny');
    } else {
      emailTools.forEach((tool, i) => {
        console.log(`${i+1}. ${tool.name} (${tool.category}) - ${tool.id}`);
        console.log(`   Popis: ${tool.description?.substring(0, 100)}...`);
      });
    }
    
    // Zkusíme také hledat podle jiných klíčových slov
    const marketingTools = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'marketing', mode: 'insensitive' } },
          { description: { contains: 'marketing', mode: 'insensitive' } },
          { category: { contains: 'marketing', mode: 'insensitive' } }
        ]
      },
      select: { 
        id: true, 
        name: true, 
        category: true, 
        description: true 
      },
      take: 5
    });
    
    console.log(`\n📈 Nalezeno ${marketingTools.length} marketing nástrojů (prvních 5):`);
    marketingTools.forEach((tool, i) => {
      console.log(`${i+1}. ${tool.name} (${tool.category}) - ${tool.id}`);
    });
    
  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findEmailTools(); 