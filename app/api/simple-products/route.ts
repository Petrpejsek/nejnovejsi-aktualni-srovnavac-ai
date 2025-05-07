import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

// Maximálně jednoduchý endpoint, který prostě jen vrátí data
export async function GET() {
  try {
    console.log('Simple-API: Načítám produkty z databáze')
    
    // Jednoduchý dotaz na všechny produkty
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    })
    
    console.log(`Simple-API: Načteno ${products.length} produktů`)
    
    // Vrátíme raw data bez složitých transformací
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Simple-API: Chyba při načítání produktů:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání produktů' },
      { status: 500 }
    )
  }
} 