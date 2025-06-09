import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/categories - Získat všechny kategorie s hierarchií
export async function GET() {
  try {
    // Získat všechny hlavní kategorie (bez parent_id)
    const mainCategories = await prisma.category.findMany({
      where: {
        parent_id: null
      },
      include: {
        other_Category: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    const categories = await prisma.category.findMany({
      include: {
        other_Category: true,
        Product: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      categories: mainCategories
    });

  } catch (error) {
    console.error('❌ Chyba při načítání kategorií:', error);
    return NextResponse.json({
      success: false,
      error: 'Chyba při načítání kategorií'
    }, { status: 500 });
  }
} 