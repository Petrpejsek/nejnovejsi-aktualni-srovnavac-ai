import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Základní health check
    const timestamp = new Date().toISOString()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp,
      service: 'comparee-ai',
      version: '1.0.0',
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 