import { NextRequest, NextResponse } from 'next/server';
import { getSimpleRecommendations } from '@/lib/openai-simple';
import prisma from '@/lib/prisma';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Cache pro produkty
let productsCache: any[] | null = null;
const PRODUCTS_CACHE_DURATION = 5 * 60 * 1000; // 5 minut
let lastProductsFetch = 0;

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
    const recommendations = await getSimpleRecommendations(query, products);
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