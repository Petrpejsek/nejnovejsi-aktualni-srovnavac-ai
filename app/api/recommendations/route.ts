import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/openai';
import prisma from '@/lib/prisma';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Timeout function
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('=== API /recommendations: Start (NEW VERSION 2024-12-23) ===');
  
  try {
    // Parse request with timeout
    const requestData = await withTimeout(request.json(), 5000);
    console.log('API /recommendations: Parsed request data:', requestData);
    
    const { query } = requestData;
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ 
        error: 'Query is required and must be a string' 
      }, { status: 400 });
    }

    const trimmedQuery = query.trim().substring(0, 150);
    console.log('API /recommendations: Přijatý dotaz:', trimmedQuery);

    // Get products with optimized query and timeout
    console.log('API /recommendations: Začínám načítat produkty z databáze');
    let products;
    try {
      products = await withTimeout(
        prisma.product.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            imageUrl: true,
            externalUrl: true,
            hasTrial: true,
            detailInfo: true,
            // Načítáme jen základní data, JSON pole vynecháme pro rychlost
          },
          orderBy: { name: 'asc' }
        }),
        30000 // 30 sekund timeout
      );
      console.log(`API /recommendations: Načteno ${products.length} produktů z databáze`);
    } catch (dbError) {
      console.error('API /recommendations: Chyba při načítání produktů z databáze:', dbError);
      return NextResponse.json({
        error: 'Failed to load products',
        details: dbError instanceof Error ? dbError.message : 'Database connection failed'
      }, { status: 500 });
    }

    if (!products || products.length === 0) {
      console.log('API /recommendations: Žádné produkty nenalezeny');
      return NextResponse.json({ 
        recommendations: [],
        message: 'No products found in database'
      });
    }

    // Generate recommendations with timeout
    console.log(`API /recommendations: Generuji doporučení pro dotaz: "${trimmedQuery}" s ${products.length} produkty`);
    let recommendations;
    try {
      recommendations = await withTimeout(
        generateRecommendations(trimmedQuery, products),
        25000 // 25 sekund timeout pro OpenAI
      );
      console.log(`API /recommendations: Vygenerováno ${recommendations.length} doporučení`);
    } catch (aiError) {
      console.error('API /recommendations: Chyba při generování doporučení:', aiError);
      return NextResponse.json({
        error: 'Failed to generate recommendations',
        details: aiError instanceof Error ? aiError.message : 'AI service failed'
      }, { status: 500 });
    }

    // Žádné fallbacky ani druhé pokusy – spoléháme na OpenAI a 196 produktů

    // Enrich recommendations with full product data
    console.log('API /recommendations: Obohacuji doporučení o kompletní data produktů');
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const fullProduct = await prisma.product.findUnique({
            where: { id: rec.id }
          });
          
          if (!fullProduct) {
            console.warn(`API /recommendations: Produkt ${rec.id} nenalezen`);
            return null;
          }

          return {
            ...rec,
            product: {
              ...fullProduct,
              // Bezpečné parsování JSON polí
              tags: fullProduct.tags ? (Array.isArray(fullProduct.tags) ? fullProduct.tags : []) : [],
              advantages: fullProduct.advantages ? (Array.isArray(fullProduct.advantages) ? fullProduct.advantages : []) : [],
              disadvantages: fullProduct.disadvantages ? (Array.isArray(fullProduct.disadvantages) ? fullProduct.disadvantages : []) : [],
              pricingInfo: fullProduct.pricingInfo ? (typeof fullProduct.pricingInfo === 'object' ? fullProduct.pricingInfo : {}) : {},
              videoUrls: fullProduct.videoUrls ? (Array.isArray(fullProduct.videoUrls) ? fullProduct.videoUrls : []) : []
            }
          };
        } catch (enrichError) {
          console.error(`API /recommendations: Chyba při obohacování produktu ${rec.id}:`, enrichError);
          return {
            ...rec,
            product: null,
            error: 'Failed to load product details'
          };
        }
      })
    );

    // Filter out null results
    const validRecommendations = enrichedRecommendations.filter(rec => rec !== null);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`API /recommendations: Vracím ${validRecommendations.length} obohacených doporučení (${duration.toFixed(2)}s)`);
    
    return NextResponse.json({
      recommendations: validRecommendations,
      query: trimmedQuery,
      totalProducts: products.length,
      processingTime: `${duration.toFixed(2)}s`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error('API /recommendations: Neočekávaná chyba:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: `${duration.toFixed(2)}s`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 