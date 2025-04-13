import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { generateRecommendations } from '../../../lib/openai';

// Definice typů pro doporučení
interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
}

interface EnrichedRecommendation extends Recommendation {
  product: any | null;
}

export async function POST(request: NextRequest) {
  console.log('API /recommendations: Start');
  
  try {
    // Získáme data z požadavku
    const data = await request.json();
    const { query } = data;
    console.log('API /recommendations: Přijatý dotaz:', query);

    if (!query || typeof query !== 'string') {
      console.log('API /recommendations: Chybějící nebo neplatný dotaz');
      return NextResponse.json(
        { error: 'Chybějící nebo neplatný dotaz' },
        { status: 400 }
      );
    }

    // Získáme produkty z databáze
    console.log('API /recommendations: Začínám načítat produkty z databáze');
    // Použijeme limit 100 produktů, což by mělo být dostatečné pro doporučení
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      },
      take: 100
    });
    console.log(`API /recommendations: Načteno ${products.length} produktů z databáze`);

    // Zpracujeme produkty pro OpenAI
    console.log('API /recommendations: Zpracovávám produkty pro OpenAI');
    const processedProducts = products.map(product => ({
      ...product,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
      advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
      disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages,
      pricingInfo: typeof product.pricingInfo === 'string' ? JSON.parse(product.pricingInfo) : product.pricingInfo,
      videoUrls: typeof product.videoUrls === 'string' ? JSON.parse(product.videoUrls) : product.videoUrls,
    }));

    console.log(`API /recommendations: Generuji doporučení pro dotaz: "${query}" s ${processedProducts.length} produkty`);

    // Generujeme doporučení pomocí OpenAI
    console.log('API /recommendations: Volám OpenAI...');
    const recommendations = await generateRecommendations(query, processedProducts);

    console.log(`API /recommendations: Vygenerováno ${recommendations?.length || 0} doporučení`);

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
    console.error('API /recommendations: Chyba při generování doporučení:', error);
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