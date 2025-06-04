import { NextRequest, NextResponse } from 'next/server';

// Dynamic configuration for speed
export const dynamic = 'force-dynamic';

// URL of your N8N webhook endpoint - set in environment variables
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { query, sessionId, timestamp, userAgent, locale } = body;
    
    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 New query: "${query}" (session: ${sessionId})`);
    
    // Prepare data for N8N
    const webhookPayload = {
      query: query.trim(),
      sessionId,
      timestamp: timestamp || Date.now(),
      source: 'homepage',
      userAgent,
      locale: locale || 'en-US',
      // Add metadata for better processing
      metadata: {
        clientIP: getClientIP(request),
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin'),
        requestTime: new Date().toISOString()
      }
    };

    // Check if N8N webhook URL is configured
    if (!N8N_WEBHOOK_URL) {
      console.error('❌ N8N_WEBHOOK_URL is not configured in environment variables');
      return NextResponse.json(
        { 
          error: 'N8N integration is not properly configured',
          details: 'Missing N8N_WEBHOOK_URL in server configuration'
        },
        { status: 500 }
      );
    }

    // Send request to N8N
    try {
      console.log(`📤 Sending request to N8N: ${N8N_WEBHOOK_URL}`);
      
      // Fire-and-forget call to N8N
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.N8N_API_TOKEN ? `Bearer ${process.env.N8N_API_TOKEN}` : '',
          'User-Agent': 'AI-Tools-Search/1.0',
          'Accept-Language': 'en-US'
        },
        body: JSON.stringify(webhookPayload),
      }).catch(error => {
        console.error('❌ Error sending data to N8N:', error);
        // TODO: Add fallback or retry logic here
      });
      
    } catch (n8nError) {
      console.error('❌ Failed to connect to N8N:', n8nError);
      // We continue to provide a response to the user even if N8N call fails
    }

    // Immediate response to user with preliminary information
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Your query is being processed by the AI system...',
      responseTime,
      // Preliminary results for immediate response
      preview: {
        estimatedTools: getEstimatedToolCount(query),
        categories: getRelevantCategories(query),
        processingTime: '2-5 seconds',
        status: 'analyzing'
      }
    });

  } catch (error) {
    console.error('❌ Error in webhook API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Utility function to get client IP address
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const connectionRemoteAddress = request.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  return xRealIP || connectionRemoteAddress || 'unknown';
}

// Quick preliminary estimates for immediate response
function getEstimatedToolCount(query: string): number {
  const keywords = query.toLowerCase();
  
  // Categories with more tools
  if (keywords.includes('video') || keywords.includes('youtube') || keywords.includes('tiktok')) return 8;
  if (keywords.includes('email') || keywords.includes('marketing') || keywords.includes('newsletter')) return 12;
  if (keywords.includes('website') || keywords.includes('web')) return 15;
  if (keywords.includes('automation') || keywords.includes('workflow')) return 10;
  if (keywords.includes('chat') || keywords.includes('customer') || keywords.includes('support')) return 6;
  if (keywords.includes('seo')) return 7;
  if (keywords.includes('accounting') || keywords.includes('invoice')) return 5;
  if (keywords.includes('design') || keywords.includes('graphic')) return 9;
  if (keywords.includes('ai') || keywords.includes('artificial intelligence')) return 11;
  
  return 5; // default estimate
}

function getRelevantCategories(query: string): string[] {
  const keywords = query.toLowerCase();
  const categories: string[] = [];
  
  if (keywords.includes('video') || keywords.includes('youtube')) categories.push('Video Generation');
  if (keywords.includes('email') || keywords.includes('marketing')) categories.push('Email Marketing');
  if (keywords.includes('website') || keywords.includes('web')) categories.push('Website Builder');
  if (keywords.includes('automation') || keywords.includes('workflow')) categories.push('Automation');
  if (keywords.includes('accounting') || keywords.includes('invoice')) categories.push('Accounting');
  if (keywords.includes('chat') || keywords.includes('support')) categories.push('Customer Service');
  if (keywords.includes('seo')) categories.push('SEO Tools');
  if (keywords.includes('design') || keywords.includes('graphic')) categories.push('Design & Graphics');
  if (keywords.includes('social')) categories.push('Social Media');
  if (keywords.includes('analytics')) categories.push('Analytics');
  if (keywords.includes('ai') || keywords.includes('artificial intelligence')) categories.push('AI Tools');
  
  return categories.slice(0, 3); // max 3 categories for clarity
} 