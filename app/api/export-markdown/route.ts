import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Dynamic API endpoint configuration
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔄 Markdown Export: Loading all products...');
    
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Markdown Export: Loaded ${products.length} products`);

    // Function for cleaning text for Markdown
    const cleanText = (text: string | null): string => {
      if (!text) return '';
      return text.replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\r/g, ' ');
    };

    // Markdown header
    let markdownContent = '# AI Tools Database\n\n';
    markdownContent += '| Name | Description | Price | Category | Has Trial | External URL |\n';
    markdownContent += '|------|-------------|-------|----------|-----------|-------------|\n';

    // Markdown rows
    products.forEach(product => {
      markdownContent += `| ${cleanText(product.name)} | ${cleanText(product.description)} | $${product.price || 0} | ${cleanText(product.category)} | ${product.hasTrial ? 'Yes' : 'No'} | ${cleanText(product.externalUrl)} |\n`;
    });

    const headers = new Headers({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ai-tools-database.md"',
      'Cache-Control': 'no-cache'
    });

    return new NextResponse(markdownContent, {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('❌ Markdown Export error:', error);
    return NextResponse.json(
      { error: 'Markdown export error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 