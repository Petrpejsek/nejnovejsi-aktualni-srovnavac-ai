import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.product.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Chyba při počítání produktů:', error)
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 })
  }
} 