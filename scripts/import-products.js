const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importProducts() {
  try {
    // Přečtení JSON souboru
    const productsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../products_backup.json'), 'utf8')
    );

    // Import každého produktu
    for (const product of productsData) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          tags: product.tags,
          advantages: product.advantages,
          disadvantages: product.disadvantages,
          reviews: product.reviews,
          detailInfo: product.detailInfo,
          pricingInfo: product.pricingInfo,
          videoUrls: product.videoUrls,
          externalUrl: product.externalUrl,
          hasTrial: product.hasTrial,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
        },
      });
    }

    console.log('Produkty byly úspěšně importovány do databáze.');
  } catch (error) {
    console.error('Chyba při importu produktů:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProducts(); 