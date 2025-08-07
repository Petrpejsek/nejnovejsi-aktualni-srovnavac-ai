import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Querying database for landing pages...');
    
    const allPages = await prisma.landing_pages.findMany({
      select: { 
        id: true, 
        slug: true, 
        title: true, 
        format: true, 
        language: true,
        created_at: true 
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    console.log(`📋 Found ${allPages.length} landing pages:`, allPages);

    return NextResponse.json({
      success: true,
      count: allPages.length,
      pages: allPages,
      debugInfo: {
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching landing pages:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}