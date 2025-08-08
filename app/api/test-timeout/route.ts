import { NextRequest, NextResponse } from 'next/server';

// Configure API as dynamic for Vercel
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test different timeout scenarios
    const url = new URL(request.url);
    const testDuration = parseInt(url.searchParams.get('duration') || '5');
    
    console.log(`🧪 Testing timeout with ${testDuration} seconds duration`);
    
    // Simulate work for the specified duration
    await new Promise(resolve => setTimeout(resolve, testDuration * 1000));
    
    const endTime = Date.now();
    const actualDuration = (endTime - startTime) / 1000;
    
    return NextResponse.json({
      status: 'SUCCESS',
      requested_duration: testDuration,
      actual_duration: actualDuration,
      message: `Test completed successfully after ${actualDuration.toFixed(2)} seconds`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel_region: process.env.VERCEL_REGION
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 