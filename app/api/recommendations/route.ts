import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Stav inicializace produktů
let productsInitialized = false;
let lastProductLoadTime = 0;
const PRODUCT_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hodin

// Lazy import OpenAI only when needed
async function generateRecommendationsConditional(query: string) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      recommendations: [
        { name: 'Mock Tool 1', reason: 'No OpenAI key available' },
        { name: 'Mock Tool 2', reason: 'Build-time mock data' }
      ]
    };
  }
  
  try {
    const { generateRecommendations, setProducts } = await import('@/lib/openai');
    
    // Ensure products are loaded first
    await ensureProductsLoaded(setProducts);
    
    return await generateRecommendations(query);
  } catch (error) {
    console.warn('OpenAI unavailable, using mock data:', error);
    return {
      recommendations: [
        { name: 'Fallback Tool 1', reason: 'OpenAI unavailable' },
        { name: 'Fallback Tool 2', reason: 'Service error' }
      ]
    };
  }
}

/**
 * Zajistí načtení produktů (provede se pouze jednou denně)
 */
async function ensureProductsLoaded(setProducts?: Function) {
  const now = Date.now();
  
  // Načteme produkty pouze pokud nejsou inicializované nebo uběhlo více než 24h
  if (productsInitialized && (now - lastProductLoadTime) < PRODUCT_REFRESH_INTERVAL) {
    return;
  }
  
  try {
    console.time('Načítání produktů');
    // Načteme produkty z DB s potřebnými daty
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        imageUrl: true,
        externalUrl: true,
        price: true,
        hasTrial: true,
        advantages: true,
        disadvantages: true,
        detailInfo: true,
        pricingInfo: true,
        videoUrls: true
      }
    });
    
    console.log(`Načteno ${products.length} produktů z databáze`);
    
    // Nastavíme produkty do globální cache jen pokud máme setProducts funkci
    if (setProducts) {
      setProducts(products);
    }
    
    // Aktualizujeme stav
    productsInitialized = true;
    lastProductLoadTime = now;
    console.timeEnd('Načítání produktů');
  } catch (error) {
    console.error('Chyba při načítání produktů:', error);
    throw error;
  }
}

/**
 * GET endpoint pro lazy loading podobných produktů podle kategorií
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categories = searchParams.get("categories")?.split(",") ?? [];
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = parseInt(searchParams.get("limit") ?? "5", 10);
    
    // nově – získáme id produktů, které už jsou zobrazené
    const excludeIds = searchParams.get("exclude")?.split(",") ?? [];

    if (categories.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Filtrovat pouze neprázdné kategorie
    const validCategories = categories.filter(cat => cat.trim().length > 0);
    
    if (validCategories.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            category: {
              in: validCategories
            }
          },
          {
            id: { 
              notIn: excludeIds 
            }
          }
        ]
      }
      // fetch všech, seřadíme ručně
    });

    // Seřadíme produkty podle počtu shodných kategorií (nejpodobnější nahoře)
    const sorted = products.sort((a, b) => {
      const matchA = validCategories.includes(a.category || '') ? 1 : 0;
      const matchB = validCategories.includes(b.category || '') ? 1 : 0;
      return matchB - matchA;
    });

    return NextResponse.json({
      products: sorted.slice(offset, offset + limit)
    });
  } catch (error) {
    console.error('Chyba v GET /api/recommendations:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint pro doporučování AI nástrojů
 */
export async function POST(request: NextRequest) {
  const requestStart = Date.now();

  try {
    // 1️⃣ Získej dotaz z těla
    const body = await request.json();
    const query: string = (body?.query || '').trim();

    if (!query) {
      return NextResponse.json(
        { error: 'Chybí parametr "query"' },
        { status: 400 }
      );
    }

    // 2️⃣ Vygeneruj doporučení (rychlý předvýběr + OpenAI)
    const { recommendations } = await generateRecommendationsConditional(query);

    // 3️⃣ Odešli klientovi
    return NextResponse.json({
      recommendations,
      processingTimeMs: Date.now() - requestStart,
    });
  } catch (error: any) {
    console.error('Chyba v /api/recommendations:', error);
    return NextResponse.json(
      { error: error.message || 'Interní chyba serveru' },
      { status: 500 }
    );
  }
} 