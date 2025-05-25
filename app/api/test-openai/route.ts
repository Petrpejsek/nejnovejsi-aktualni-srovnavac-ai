import { NextRequest, NextResponse } from 'next/server';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    const keyPreview = process.env.OPENAI_API_KEY ? 
      `...${process.env.OPENAI_API_KEY.slice(-4)}` : 
      'NOT_SET';
    
    // Check if assistant ID is available
    const assistantId = 'asst_unwHSr7Dqc1odJLkbdtAzRbo';
    
    return NextResponse.json({
      status: 'OK',
      openai_key_available: hasApiKey,
      openai_key_preview: keyPreview,
      assistant_id: assistantId,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 