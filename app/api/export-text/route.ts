import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔄 Text Export: Načítám všechny produkty...');
    
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Text Export: Načteno ${products.length} produktů`);

    let textContent = `AI NÁSTROJE - KOMPLETNÍ DATABÁZE
===============================================

Datum exportu: ${new Date().toLocaleDateString('cs-CZ')}
Celkem nástrojů: ${products.length}

===============================================

`;

    products.forEach((product, index) => {
      textContent += `${index + 1}. ${product.name}
${'='.repeat(product.name.length + 3)}

ID: ${product.id}

ZÁKLADNÍ INFORMACE:
- Kategorie: ${product.category || 'Nezařazeno'}
- Cena: ${product.price || 'Neuvedeno'}
- Má trial verzi: ${product.hasTrial ? 'Ano' : 'Ne'}

POPIS:
${product.description || 'Žádný popis není k dispozici'}

TAGY:
${product.tags || 'Žádné tagy'}

VÝHODY:
${product.advantages || 'Neuvedeno'}

NEVÝHODY:
${product.disadvantages || 'Neuvedeno'}

RECENZE:
${product.reviews || 'Žádné recenze'}

CENOVÉ INFORMACE:
${product.pricingInfo || 'Neuvedeno'}

DETAILNÍ INFORMACE:
${product.detailInfo || 'Neuvedeno'}

ODKAZY:
- Externí URL: ${product.externalUrl || 'Neuvedeno'}
- Video: ${product.videoUrls || 'Neuvedeno'}

METADATA:
- Vytvořeno: ${product.createdAt.toLocaleDateString('cs-CZ')}
- Aktualizováno: ${product.updatedAt.toLocaleDateString('cs-CZ')}

${'─'.repeat(80)}

`;
    });

    textContent += `
KONEC DATABÁZE
===============================================
Celkem exportováno: ${products.length} AI nástrojů
`;

    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ai-tools-databaze.txt"',
      'Cache-Control': 'no-cache'
    });

    return new NextResponse(textContent, {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('❌ Text Export chyba:', error);
    return NextResponse.json(
      { error: 'Chyba při textovém exportu', details: error instanceof Error ? error.message : 'Neznámá chyba' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 