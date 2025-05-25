import { NextRequest, NextResponse } from 'next/server';
import { generateAssistantRecommendations } from '../../../lib/assistantRecommendations';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Chybí dotaz.' }, { status: 400 });
    }
    
    console.log('🔍 Generuji doporučení pro:', query);
    const recommendations = await generateAssistantRecommendations(query);
    console.log(`✅ Vygenerováno ${recommendations.length} doporučení`);
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('❌ Chyba při generování doporučení:', error);
    return NextResponse.json({
      error: 'Chyba při generování doporučení',
      details: error instanceof Error ? error.message : 'Neznámá chyba'
    }, { status: 500 });
  }
} 