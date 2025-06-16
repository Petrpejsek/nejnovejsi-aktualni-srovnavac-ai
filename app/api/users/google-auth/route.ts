import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, name, googleId } = await request.json();

    if (!email || !googleId) {
      return NextResponse.json(
        { success: false, error: 'Email a Google ID jsou povinné' },
        { status: 400 }
      );
    }

    // Zkusíme najít existujícího uživatele podle emailu
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Pokud uživatel existuje, aktualizujeme jeho Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          googleId,
          name: name || user.name // Aktualizujeme jméno pokud je nové lepší
        }
      });
    } else {
      // Vytvoříme nového uživatele
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Použijeme jméno nebo část emailu
          googleId,
          // Heslo nenastavujeme - uživatel se přihlašuje přes Google
        }
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('🔴 Google auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při zpracování Google přihlášení' },
      { status: 500 }
    );
  }
} 