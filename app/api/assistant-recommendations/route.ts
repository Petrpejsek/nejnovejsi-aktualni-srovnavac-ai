import { NextRequest, NextResponse } from 'next/server';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Lazy import assistant recommendations only when needed
async function generateAssistantRecommendationsConditional(query: string) {
  if (!process.env.OPENAI_API_KEY) {
    return [
      {
        id: 'mock-1',
        name: 'Mock AI Tool 1',
        description: 'Mock description for build compatibility',
        category: 'AI Tools',
        tags: ['mock', 'build'],
        price: 0,
        match_percentage: 90,
        reason: 'No OpenAI key available during build'
      },
      {
        id: 'mock-2',
        name: 'Mock AI Tool 2',
        description: 'Another mock tool for build compatibility',
        category: 'AI Tools',
        tags: ['mock', 'fallback'],
        price: 0,
        match_percentage: 85,
        reason: 'Build-time fallback recommendation'
      }
    ];
  }
  
  try {
    const { generateAssistantRecommendations } = await import('../../../lib/assistantRecommendations');
    return await generateAssistantRecommendations(query);
  } catch (error) {
    console.warn('AssistantRecommendations unavailable, using mock data:', error);
    return [
      {
        id: 'fallback-1',
        name: 'Fallback Tool 1',
        description: 'Service temporarily unavailable',
        category: 'AI Tools',
        tags: ['fallback'],
        price: 0,
        match_percentage: 75,
        reason: 'Service temporarily unavailable'
      }
    ];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is missing.' }, { status: 400 });
    }
    
    console.log('🔍 Generating recommendations for:', query);
    const recommendations = await generateAssistantRecommendationsConditional(query);
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