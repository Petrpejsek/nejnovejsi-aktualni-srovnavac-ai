import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

// Maximálně jednoduchý endpoint, který vrací omezená data
export async function GET() {
  try {
    console.log('Simple-API: Načítám produkty z databáze')
    
    // Jednoduchý dotaz na všechny produkty, ale se základními poli
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      // Vybíráme jen nejnutnější pole, abychom omezili velikost odpovědi
      select: {
        id: true,
        name: true,
        price: true,
        category: true
      }
    })
    
    console.log(`Simple-API: Načteno ${products.length} produktů`)
    
    // Vrátíme omezená data bez složitých transformací
    return NextResponse.json({ 
      products,
      count: products.length
    })
  } catch (error) {
    console.error('Simple-API: Chyba při načítání produktů:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání produktů' },
      { status: 500 }
    )
  }
} 