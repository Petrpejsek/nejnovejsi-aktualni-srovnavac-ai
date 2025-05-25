import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Dynamic API endpoint configuration
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Export: Loading all products from database...');
    
    // Load all products without pagination
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Export: Loaded ${products.length} products`);

    // Prepare data for export
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalProducts: products.length,
        description: "Complete export of all AI tools from database"
      },
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        imageUrl: product.imageUrl,
        tags: typeof product.tags === 'string' ? JSON.parse(product.tags || '[]') : product.tags,
        advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages || '[]') : product.advantages,
        disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages || '[]') : product.disadvantages,
        pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo || '{}') : product.pricingInfo,
        videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls || '[]') : product.videoUrls,
        detailInfo: product.detailInfo,
        externalUrl: product.externalUrl,
        hasTrial: product.hasTrial,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }))
    };

    // Set headers for file download
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="ai-tools-complete-database.json"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('❌ Export error:', error);
    return NextResponse.json(
      { error: 'Product export error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 