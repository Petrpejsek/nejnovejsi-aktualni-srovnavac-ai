import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Cache pro produkty
let productsCache: any[] | null = null;
const PRODUCTS_CACHE_DURATION = 5 * 60 * 1000; // 5 minut
let lastProductsFetch = 0;

// Lazy import OpenAI only when needed
async function getSimpleRecommendationsConditional(query: string, products: any[]) {
  if (!process.env.OPENAI_API_KEY) {
    // Return mock recommendations for build compatibility
    return [
      {
        id: 'mock-simple-1',
        name: 'Mock Simple Tool 1',
        description: 'Mock description for build compatibility',
        category: 'AI Tools',
        relevanceScore: 90,
        reason: 'No OpenAI key available during build'
      },
      {
        id: 'mock-simple-2',
        name: 'Mock Simple Tool 2',
        description: 'Another mock tool for build compatibility',
        category: 'AI Tools',
        relevanceScore: 85,
        reason: 'Build-time fallback recommendation'
      }
    ];
  }
  
  try {
    const { getSimpleRecommendations } = await import('@/lib/openai-simple');
    return await getSimpleRecommendations(query, products);
  } catch (error) {
    console.warn('OpenAI Simple unavailable, using mock data:', error);
    // Return basic keyword-based recommendations
    const matchingProducts = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);
    
    return matchingProducts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      relevanceScore: 75,
      reason: 'Keyword match (OpenAI unavailable)'
    }));
  }
}

async function getProducts() {
  const now = Date.now();
  
  // Použijeme cache pokud je platná
  if (productsCache && (now - lastProductsFetch) < PRODUCTS_CACHE_DURATION) {
    console.log('Používám produktovou cache');
    return productsCache;
  }

  console.log('Načítám produkty z DB');
  // Načteme produkty z DB s minimem potřebných dat
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      tags: true
    }
  });

  // Aktualizujeme cache
  productsCache = products;
  lastProductsFetch = now;
  
  console.log(`Načteno ${products.length} produktů z DB`);
  return products;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    // Parsujeme požadavek
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Nebyl zadán žádný dotaz' }, { status: 400 });
    }

    console.log(`API: Zpracovávám dotaz: "${query}"`);

    // Načteme produkty (z cache nebo DB)
    const products = await getProducts();

    // Generujeme doporučení pomocí zjednodušené funkce
    const recommendations = await getSimpleRecommendationsConditional(query, products);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`Vracím ${recommendations.length} doporučení za ${duration}s`);
    return NextResponse.json(recommendations);

  } catch (error) {
    console.error('Chyba v API recommendations-simple:', error);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Chyba po ${duration}s`);
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
  }
} 