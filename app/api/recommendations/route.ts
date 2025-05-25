import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { generateRecommendations } from '../../../lib/openai';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Type definitions for recommendations
interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
}

interface EnrichedRecommendation extends Recommendation {
  product: any | null;
}

export async function POST(request: NextRequest) {
  console.log('=== API /recommendations: Start ===');
  
  try {
    // Získáme data z požadavku
    const requestText = await request.text();
    console.log('API /recommendations: Raw request text:', requestText);
    
    // Ověříme, zda má text rozumný formát JSON
    if (!requestText || requestText.trim().length < 2) {
      console.error('API /recommendations: Prázdný nebo příliš krátký požadavek');
      return NextResponse.json(
        { error: 'Prázdný nebo neplatný požadavek' },
        { status: 400 }
      );
    }
    
    // Zkusíme parsovat JSON
    let data;
    try {
      data = JSON.parse(requestText);
      console.log('API /recommendations: Parsed request data:', data);
    } catch (parseError) {
      console.error('API /recommendations: Chyba při parsování JSON z požadavku:', parseError);
      return NextResponse.json(
        { error: 'Neplatný JSON formát v požadavku', details: parseError instanceof Error ? parseError.message : 'Unknown parsing error' },
        { status: 400 }
      );
    }
    
    const { query } = data;
    console.log('API /recommendations: Přijatý dotaz:', query);

    if (!query || typeof query !== 'string') {
      console.log('API /recommendations: Chybějící nebo neplatný dotaz');
      return NextResponse.json(
        { error: 'Chybějící nebo neplatný dotaz' },
        { status: 400 }
      );
    }

    // Zkrátíme dotaz, pokud je příliš dlouhý
    const maxQueryLength = 150; // Omezení délky dotazu
    const sanitizedQuery = query.substring(0, maxQueryLength);
    console.log(`API /recommendations: Upravený dotaz (max ${maxQueryLength} znaků):`, sanitizedQuery);

    // Získáme produkty z databáze
    console.log('API /recommendations: Začínám načítat produkty z databáze');
    let products;
    try {
      products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          tags: true,
          advantages: true,
          disadvantages: true,
          pricingInfo: true,
          videoUrls: true,
          detailInfo: true,
          imageUrl: true,
          externalUrl: true,
          hasTrial: true
        },
        orderBy: {
          name: 'asc'
        }
      });
      console.log(`API /recommendations: Načteno ${products.length} produktů z databáze`);
    } catch (dbError) {
      console.error('API /recommendations: Chyba při načítání produktů z databáze:', dbError);
      return NextResponse.json(
        { error: 'Chyba při načítání produktů z databáze', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    // Zpracujeme produkty pro OpenAI - bezpečně ošetříme známé chyby
    console.log('API /recommendations: Zpracovávám produkty pro OpenAI');
    let processedProducts;
    try {
      processedProducts = products.map(product => {
        // Pokud je produkt známý jako problematický, přeskočíme jeho JSON parsování
        if (product.id === '8b1ad8a1-5afb-40d4-b11d-48c33b606723') {
          console.log(`API /recommendations: Speciální zpracování problematického produktu ${product.id}`);
          return {
            ...product,
            tags: [],
            advantages: [],
            disadvantages: [],
            pricingInfo: {},
            videoUrls: []
          };
        }
        
        try {
          // Bezpečné parsování všech JSON polí
          const safelyParse = (field: any, defaultValue: any) => {
            if (!field) return defaultValue;
            if (typeof field !== 'string') return field;
            try {
              return JSON.parse(field);
            } catch (e) {
              console.warn(`API /recommendations: Chyba při parsování pole u produktu ${product.id}:`, e);
              return defaultValue;
            }
          };
          
          return {
            ...product,
            tags: safelyParse(product.tags, []),
            advantages: safelyParse(product.advantages, []),
            disadvantages: safelyParse(product.disadvantages, []),
            pricingInfo: safelyParse(product.pricingInfo, {}),
            videoUrls: safelyParse(product.videoUrls, []),
          };
        } catch (parseError) {
          console.error(`API /recommendations: Chyba při zpracování produktu ${product.id}:`, parseError);
          // Při chybě JSON parsování vrátíme produkt s prázdnými hodnotami
          return {
            ...product,
            tags: [],
            advantages: [],
            disadvantages: [],
            pricingInfo: {},
            videoUrls: []
          };
        }
      });
      console.log(`API /recommendations: Zpracováno ${processedProducts.length} produktů`);
    } catch (procError) {
      console.error('API /recommendations: Chyba při zpracování produktů:', procError);
      return NextResponse.json(
        { error: 'Chyba při zpracování produktů', details: procError instanceof Error ? procError.message : 'Unknown processing error' },
        { status: 500 }
      );
    }

    console.log(`API /recommendations: Generating recommendations for query: "${sanitizedQuery}" with ${processedProducts.length} products`);

          // Generate recommendations using OpenAI
          console.log('API /recommendations: Calling OpenAI...');
    let recommendations;
    try {
      recommendations = await generateRecommendations(sanitizedQuery, processedProducts);
      console.log(`API /recommendations: Vygenerováno ${recommendations?.length || 0} doporučení`);
    } catch (openaiError) {
      console.error('API /recommendations: Chyba při generování doporučení přes OpenAI:', openaiError);
      return NextResponse.json(
        { error: 'Chyba při generování doporučení', details: openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error' },
        { status: 500 }
      );
    }

    if (!recommendations || recommendations.length === 0) {
      console.log('API /recommendations: Žádná doporučení nebyla vygenerována');
      return NextResponse.json(
        { 
          recommendations: [],
          message: "Žádná doporučení nebyla nalezena" 
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Obohacujeme doporučení o kompletní data produktů
    console.log('API /recommendations: Obohacuji doporučení o kompletní data produktů');
    const enrichedRecommendations = recommendations.map((recommendation: Recommendation) => {
      const product = processedProducts.find(p => p.id === recommendation.id);
      return {
        ...recommendation,
        product: product || null
      };
    }).filter((rec: EnrichedRecommendation) => rec.product !== null);

    console.log(`API /recommendations: Vracím ${enrichedRecommendations.length} obohacených doporučení`);
    return NextResponse.json(
      { recommendations: enrichedRecommendations },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('API /recommendations: Neošetřená chyba při generování doporučení:', error);
    if (error instanceof Error) {
      console.error('API /recommendations: Detaily chyby:', error.message);
      console.error('API /recommendations: Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Chyba při generování doporučení', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 