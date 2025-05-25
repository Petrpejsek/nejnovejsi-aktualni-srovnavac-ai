import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Konfigurace dynamického API endpointu
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔄 Text Export: Loading all products...');
    
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Text Export: Loaded ${products.length} products`);

    let textContent = `AI TOOLS DATABASE\n`;
    textContent += `===================\n\n`;
    textContent += `Export Date: ${new Date().toLocaleDateString()}\n`;
    textContent += `Total Tools: ${products.length}\n\n`;
    textContent += `${'='.repeat(50)}\n\n`;

    products.forEach((product, index) => {
      textContent += `${index + 1}. ${product.name}\n`;
      textContent += `${'-'.repeat(product.name.length + 3)}\n`;
      textContent += `ID: ${product.id}\n`;
      textContent += `Category: ${product.category || 'Uncategorized'}\n`;
      textContent += `Price: $${product.price || 0}\n`;
      textContent += `Has Trial: ${product.hasTrial ? 'Yes' : 'No'}\n`;
      textContent += `Description: ${product.description || 'No description available'}\n`;
      textContent += `External URL: ${product.externalUrl || 'Not provided'}\n`;
      textContent += `\n${'-'.repeat(50)}\n\n`;
    });

    textContent += `\nSTATISTICS\n`;
    textContent += `==========\n`;
    textContent += `Total exported: ${products.length} AI tools\n`;
    textContent += `Export created: ${new Date().toLocaleString()}\n`;

    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ai-tools-database.txt"',
      'Cache-Control': 'no-cache'
    });

    return new NextResponse(textContent, {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('❌ Text Export error:', error);
    return NextResponse.json(
      { error: 'Text export error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 