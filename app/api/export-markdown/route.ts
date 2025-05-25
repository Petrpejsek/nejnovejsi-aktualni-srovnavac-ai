import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔄 Markdown Export: Načítám všechny produkty...');
    
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Markdown Export: Načteno ${products.length} produktů`);

    let markdownContent = `# AI Nástroje - Kompletní Databáze

> **Datum exportu:** ${new Date().toLocaleDateString('cs-CZ')}  
> **Celkem nástrojů:** ${products.length}

---

`;

    products.forEach((product, index) => {
      markdownContent += `## ${index + 1}. ${product.name}

**ID:** \`${product.id}\`

### 📋 Základní informace
- **Kategorie:** ${product.category || 'Nezařazeno'}
- **Cena:** ${product.price || 'Neuvedeno'}
- **Trial verze:** ${product.hasTrial ? '✅ Ano' : '❌ Ne'}

### 📝 Popis
${product.description || 'Žádný popis není k dispozici'}

### 🏷️ Tagy
\`${product.tags || 'Žádné tagy'}\`

### ✅ Výhody
${product.advantages || 'Neuvedeno'}

### ❌ Nevýhody
${product.disadvantages || 'Neuvedeno'}

### ⭐ Recenze
${product.reviews || 'Žádné recenze'}

### 💰 Cenové informace
${product.pricingInfo || 'Neuvedeno'}

### 📖 Detailní informace
${product.detailInfo || 'Neuvedeno'}

### 🔗 Odkazy
- **Externí URL:** ${product.externalUrl ? `[Link](${product.externalUrl})` : 'Neuvedeno'}
- **Obrázek:** ${product.imageUrl ? `[Obrázek](${product.imageUrl})` : 'Neuvedeno'}
- **Video:** ${product.videoUrls ? `[Video](${product.videoUrls})` : 'Neuvedeno'}

### ⏰ Metadata
- **Vytvořeno:** ${product.createdAt.toLocaleDateString('cs-CZ')}
- **Aktualizováno:** ${product.updatedAt.toLocaleDateString('cs-CZ')}

---

`;
    });

    markdownContent += `
## 📊 Statistiky

- **Celkem exportováno:** ${products.length} AI nástrojů
- **Export vytvořen:** ${new Date().toLocaleString('cs-CZ')}

---

*Konec databáze*
`;

    const headers = new Headers({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ai-tools-databaze.md"',
      'Cache-Control': 'no-cache'
    });

    return new NextResponse(markdownContent, {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('❌ Markdown Export chyba:', error);
    return NextResponse.json(
      { error: 'Chyba při Markdown exportu', details: error instanceof Error ? error.message : 'Neznámá chyba' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 