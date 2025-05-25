import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findMailingProducts() {
  try {
    console.log('🔍 Hledám produkty pro mailing a ads...');
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'mail', mode: 'insensitive' } },
          { name: { contains: 'email', mode: 'insensitive' } },
          { name: { contains: 'klaviyo', mode: 'insensitive' } },
          { name: { contains: 'mailchimp', mode: 'insensitive' } },
          { name: { contains: 'getresponse', mode: 'insensitive' } },
          { description: { contains: 'email', mode: 'insensitive' } },
          { description: { contains: 'mail', mode: 'insensitive' } },
          { description: { contains: 'marketing', mode: 'insensitive' } },
          { category: { contains: 'Email', mode: 'insensitive' } },
          { category: { contains: 'Marketing', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true
      }
    });
    
    console.log(`📊 Nalezeno ${products.length} produktů:`);
    products.forEach((p, index) => {
      console.log(`${index + 1}. ID: ${p.id}`);
      console.log(`   Název: ${p.name}`);
      console.log(`   Kategorie: ${p.category}`);
      console.log(`   Popis: ${p.description ? p.description.substring(0, 100) + '...' : 'Žádný popis'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findMailingProducts(); 