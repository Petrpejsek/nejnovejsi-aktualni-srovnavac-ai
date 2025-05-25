import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Export: Načítám všechny produkty z databáze...');
    
    // Načti všechny produkty bez stránkování
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Export: Načteno ${products.length} produktů`);

    // Připrav data pro export
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalProducts: products.length,
        description: "Kompletní export všech AI nástrojů z databáze"
      },
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        imageUrl: product.imageUrl,
        tags: product.tags,
        advantages: product.advantages,
        disadvantages: product.disadvantages,
        pricingInfo: product.pricingInfo,
        videoUrls: product.videoUrls,
        detailInfo: product.detailInfo,
        externalUrl: product.externalUrl,
        hasTrial: product.hasTrial,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }))
    };

    // Nastav hlavičky pro stažení souboru
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="ai-tools-complete-database.json"',
      'Cache-Control': 'no-cache'
    });

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('❌ Export chyba:', error);
    return NextResponse.json(
      { error: 'Chyba při exportu produktů', details: error instanceof Error ? error.message : 'Neznámá chyba' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 