const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncDatabase() {
  try {
    // Zkontrolujeme připojení k databázi
    await prisma.$connect();
    console.log('✅ Úspěšně připojeno k databázi');

    // Zde můžete přidat další synchronizační logiku
    // například import dat z JSON souboru:
    
    // const products = require('./data/products.json');
    // await prisma.product.createMany({
    //   data: products,
    //   skipDuplicates: true,
    // });

    console.log('✅ Synchronizace dokončena');
  } catch (error) {
    console.error('❌ Chyba při synchronizaci:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDatabase(); 