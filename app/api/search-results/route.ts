import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export const dynamic = 'force-dynamic';

// For real-time communication - we can add Pusher or WebSockets later
// For now we'll use polling or localStorage for frontend communication

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, recommendations, totalFound, processingTime, query } = body;
    
    if (!sessionId || !recommendations) {
      return NextResponse.json(
        { error: 'Missing required parameters (sessionId, recommendations)' },
        { status: 400 }
      );
    }

    console.log(`📨 Results from N8N for session ${sessionId}: ${totalFound} tools in ${processingTime}ms`);
    
    // Validate recommendations structure
    if (!Array.isArray(recommendations)) {
      return NextResponse.json(
        { error: 'Recommendations must be an array' },
        { status: 400 }
      );
    }

    // Save results to database for cache and analytics
    try {
      await saveSearchResults({
        sessionId,
        query: query || '',
        recommendations,
        totalFound: totalFound || recommendations.length,
        processingTime: processingTime || null,
        createdAt: new Date()
      });
    } catch (dbError) {
      console.error('⚠️ Error saving to database:', dbError);
      // Continue even with DB error - we don't want to block the user
    }

    // Response structure for frontend
    const responseData = {
      sessionId,
      recommendations: recommendations.map((rec: any, index: number) => ({
        id: rec.id || rec.tool_id || `temp-${index}`,
        matchPercentage: Math.min(99, Math.max(82, rec.matchPercentage || rec.match_score || 85)),
        recommendation: rec.recommendation || rec.personalized_recommendation || 'Recommended tool for your needs.',
        product: rec.product || {},
        benefits: rec.main_benefits || rec.benefits || [],
        personalizedReason: rec.personalizedReason || '',
        urgencyBonus: rec.urgencyBonus || 0,
        contextualTips: rec.contextualTips || []
      })),
      totalFound: totalFound || recommendations.length,
      processingTime,
      timestamp: Date.now(),
      status: 'completed'
    };

    // TODO: Add real-time notification here (WebSocket/Pusher)
    // For now we'll save to cache for polling
    await saveToCache(sessionId, responseData);

    return NextResponse.json({
      success: true,
      delivered: true,
      sessionId,
      resultsCount: recommendations.length,
      message: 'Results successfully processed'
    });

  } catch (error) {
    console.error('❌ Error processing results from N8N:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for polling results from frontend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId is required' },
        { status: 400 }
      );
    }

    // Load results from cache
    const results = await getFromCache(sessionId);
    
    if (results) {
      return NextResponse.json({
        found: true,
        data: results
      });
    } else {
      return NextResponse.json({
        found: false,
        message: 'Results are not ready yet'
      });
    }

  } catch (error) {
    console.error('❌ Error retrieving results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Save results to database for analytics and cache
async function saveSearchResults(data: {
  sessionId: string;
  query: string;
  recommendations: any[];
  totalFound: number;
  processingTime: number | null;
  createdAt: Date;
}) {
  try {
    // If there's a search_results table in the Prisma schema
    // await prisma.searchResults.create({
    //   data: {
    //     sessionId: data.sessionId,
    //     query: data.query,
    //     recommendations: JSON.stringify(data.recommendations),
    //     totalFound: data.totalFound,
    //     processingTime: data.processingTime,
    //     createdAt: data.createdAt
    //   }
    // });

    // For now we'll log to the console
    console.log(`💾 Saving results for session ${data.sessionId}: ${data.totalFound} tools`);
    
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

// Cache for quick retrieval of results (can use Redis or in-memory)
const resultsCache = new Map<string, any>();

async function saveToCache(sessionId: string, data: any) {
  try {
    // For production use Redis or other persistent cache
    resultsCache.set(sessionId, {
      ...data,
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minute expiry
    });
    
    console.log(`💾 Saved to cache for session ${sessionId}`);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

async function getFromCache(sessionId: string): Promise<any | null> {
  try {
    const cached = resultsCache.get(sessionId);
    
    if (!cached) {
      return null;
    }
    
    // Check expiry
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      resultsCache.delete(sessionId);
      return null;
    }
    
    console.log(`📤 Loading from cache for session ${sessionId}`);
    return cached;
    
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
}

// Cleanup old records in cache (run periodically)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of resultsCache.entries()) {
    if (data.expiresAt && now > data.expiresAt) {
      resultsCache.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // every 5 minutes 