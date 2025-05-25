import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔄 CSV Export: Načítám všechny produkty...');
    
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ CSV Export: Načteno ${products.length} produktů`);

    // CSV hlavička
    const csvHeader = 'ID;Název;Popis;Kategorie;Cena;Obrázek;Tagy;Výhody;Nevýhody;Recenze;Cenové info;Video URL;Detail;Externí URL;Má trial;Vytvořeno;Aktualizováno\n';
    
    // CSV řádky
    const csvRows = products.map(product => {
      const cleanText = (text: string | null) => {
        if (!text) return '';
        return text.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ');
      };

      return [
        product.id,
        `"${cleanText(product.name)}"`,
        `"${cleanText(product.description)}"`,
        `"${cleanText(product.category)}"`,
        product.price || 0,
        `"${cleanText(product.imageUrl)}"`,
        `"${cleanText(product.tags)}"`,
        `"${cleanText(product.advantages)}"`,
        `"${cleanText(product.disadvantages)}"`,
        `"${cleanText(product.reviews)}"`,
        `"${cleanText(product.pricingInfo)}"`,
        `"${cleanText(product.videoUrls)}"`,
        `"${cleanText(product.detailInfo)}"`,
        `"${cleanText(product.externalUrl)}"`,
        product.hasTrial ? 'Ano' : 'Ne',
        product.createdAt.toISOString().split('T')[0],
        product.updatedAt.toISOString().split('T')[0]
      ].join(';');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    const headers = new Headers({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ai-tools-databaze.csv"',
      'Cache-Control': 'no-cache'
    });

    return new NextResponse('\ufeff' + csvContent, {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('❌ CSV Export chyba:', error);
    return NextResponse.json(
      { error: 'Chyba při CSV exportu', details: error instanceof Error ? error.message : 'Neznámá chyba' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 