import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Force dynamic rendering to fix Vercel build error
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

// Lazy import OpenAI only when needed
async function generateRecommendationsConditional(query: string) {
  if (!process.env.OPENAI_API_KEY) {
    return [
      { name: 'Test Recommendation 1', reason: 'No OpenAI key available' },
      { name: 'Test Recommendation 2', reason: 'Mock data only' }
    ];
  }
  
  try {
    const { generateRecommendations } = await import('@/lib/openai');
    return await generateRecommendations(query);
  } catch (error) {
    console.warn('OpenAI unavailable, using mock data:', error);
    return [
      { name: 'Mock Recommendation 1', reason: 'OpenAI unavailable' },
      { name: 'Mock Recommendation 2', reason: 'Fallback data' }
    ];
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('=== TEST Simple Recommendations ===');
  
  try {
    const { query } = await request.json();
    console.log('Query:', query);

    // Načteme produkty chytřeji - pokud dotaz obsahuje "email" nebo "marketing", 
    // zahrneme relevantní nástroje
    let products;
    
    if (query.toLowerCase().includes('email') || query.toLowerCase().includes('mail') || query.toLowerCase().includes('marketing')) {
      // Pro email/marketing dotazy zahrneme relevantní nástroje
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: 'email', mode: 'insensitive' } },
            { name: { contains: 'mail', mode: 'insensitive' } },
            { name: { contains: 'marketing', mode: 'insensitive' } },
            { description: { contains: 'email', mode: 'insensitive' } },
            { description: { contains: 'marketing', mode: 'insensitive' } },
            { category: { contains: 'marketing', mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
        },
        take: 10
      });
    } else {
      // Pro ostatní dotazy použijeme prvních 10 produktů
      products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
        },
        take: 10
      });
    }
    
    console.log(`Načteno ${products.length} produktů pro dotaz "${query}"`);
    console.log('Produkty:', products.map(p => `${p.name} (${p.category})`).join(', '));

    // Vygenerujeme doporučení
    const recommendations = await generateRecommendationsConditional(query);
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`Test dokončen za ${duration}s`);

    return NextResponse.json({
      recommendations,
      duration: `${duration}s`,
      productCount: products.length,
      productNames: products.map(p => p.name)
    });

  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error('Test error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}s`
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 