#!/usr/bin/env node

/**
 * Script pro opravu imageUrl v databázi
 * Nastaví všechny neexistující screenshot cesty na null
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('🔧 Opravuji imageUrl v databázi...');
  
  try {
    // Najdi všechny produkty s imageUrl obsahující "/screenshots/"
    const productsWithScreenshots = await prisma.product.findMany({
      where: {
        imageUrl: {
          contains: '/screenshots/'
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });

    console.log(`📊 Nalezeno ${productsWithScreenshots.length} produktů s screenshot odkazy`);

    let updatedCount = 0;

    for (const product of productsWithScreenshots) {
      // Zkontroluj, jestli soubor skutečně existuje
      const imagePath = path.join(process.cwd(), 'public', product.imageUrl);
      const exists = fs.existsSync(imagePath);

      if (!exists) {
        // Soubor neexistuje - nastav imageUrl na null
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: null }
        });
        
        console.log(`✅ ${product.name}: ${product.imageUrl} → null`);
        updatedCount++;
      } else {
        console.log(`⚠️  ${product.name}: Soubor existuje - ponechávám`);
      }
    }

    console.log(`🎉 Úspěšně aktualizováno ${updatedCount} produktů`);
    console.log('✅ Nyní se budou používat SVG placeholdery');

  } catch (error) {
    console.error('❌ Chyba při opravě databáze:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls(); 