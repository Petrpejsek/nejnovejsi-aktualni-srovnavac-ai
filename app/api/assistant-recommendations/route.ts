import { NextRequest, NextResponse } from 'next/server';
import { generateAssistantRecommendations } from '../../../lib/assistantRecommendations';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is missing.' }, { status: 400 });
    }
    
    console.log('🔍 Generating recommendations for:', query);
    const recommendations = await generateAssistantRecommendations(query);
    console.log(`✅ Generated ${recommendations.length} recommendations`);
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    return NextResponse.json({
      error: 'Error generating recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 