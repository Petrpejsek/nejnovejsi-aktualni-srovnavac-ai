import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Vždy načíst aktuální počet z databáze - žádná cache
    const count = await prisma.product.count({
      where: { 
        isActive: true,
        deletedAt: null 
      }
    })
    console.log(`📊 Product count loaded from database: ${count}`)
    
    return NextResponse.json({ 
      count: count,
      cached: false,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting product count:', error)
    
    // Zkusíme fallback dotaz bez složitých podmínek
    try {
      const fallbackCount = await prisma.product.count()
      console.log(`📊 Fallback product count: ${fallbackCount}`)
      
      return NextResponse.json({ 
        count: fallbackCount,
        cached: false,
        fallback: true,
        timestamp: new Date().toISOString()
      })
    } catch (fallbackError) {
      console.error('Fallback count also failed:', fallbackError)
      return NextResponse.json(
        { error: 'Failed to get product count' },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // POST endpoint už není potřeba - vracíme vždy aktuální data
    return NextResponse.json({ 
      message: 'Cache disabled - using real-time counts only',
      success: true
    })
  } catch (error) {
    console.error('Error in POST product count:', error)
    return NextResponse.json(
      { error: 'POST method not needed' },
      { status: 400 }
    )
  }
} 