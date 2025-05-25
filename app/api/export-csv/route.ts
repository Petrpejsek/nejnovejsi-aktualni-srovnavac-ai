import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Konfigurace dynamického API endpointu
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔄 CSV Export: Loading all products...');
    
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ CSV Export: Loaded ${products.length} products`);

    // Funkce pro čištění textu pro CSV
    const cleanText = (text: string | null): string => {
      if (!text) return '';
      return text.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ');
    };

    // CSV hlavička
    const csvHeader = [
      'ID', 'Name', 'Description', 'Price', 'Category', 'Image URL',
      'Tags', 'Advantages', 'Disadvantages', 'Reviews', 'Pricing Info', 'Video URLs',
      'External URL', 'Has Trial', 'Detail Info'
    ].join(',');

    // CSV řádky
    const csvRows = products.map(product => [
      `"${product.id}"`,
      `"${cleanText(product.name)}"`,
      `"${cleanText(product.description)}"`,
      `"${product.price || 0}"`,
      `"${cleanText(product.category)}"`,
      `"${cleanText(product.imageUrl)}"`,
      `"${cleanText(product.tags as string | null)}"`,
      `"${cleanText(product.advantages as string | null)}"`,
      `"${cleanText(product.disadvantages as string | null)}"`,
      `"${cleanText(product.reviews as string | null)}"`,
      `"${cleanText(product.pricingInfo as string | null)}"`,
      `"${cleanText(product.videoUrls as string | null)}"`,
      `"${cleanText(product.externalUrl)}"`,
      `"${product.hasTrial ? 'Yes' : 'No'}"`,
      `"${cleanText(product.detailInfo)}"`
    ].join(','));

    const csvContent = [csvHeader, ...csvRows].join('\n');

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
    console.error('❌ CSV Export error:', error);
    return NextResponse.json(
      { error: 'CSV export error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 