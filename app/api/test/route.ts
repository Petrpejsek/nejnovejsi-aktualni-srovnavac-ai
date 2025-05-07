import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'API funguje správně',
    timestamp: new Date().toISOString()
  })
} 