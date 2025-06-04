import { NextRequest, NextResponse } from 'next/server';
import { createEmbedding } from '@/lib/openai';
import prisma from '@/lib/prisma';

// Tento endpoint je pouze pro admin použití
// Pro produkci by měl být chráněn autentizací

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

/**
 * Vytvoří embedding pro každý produkt a uloží ho do databáze
 */
export async function GET(req: NextRequest) {
  try {
    // Kontrola API klíče (jednoduchá ochrana)
    const apiKey = req.nextUrl.searchParams.get('key');
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!adminKey || apiKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Nastavení limitu pro zpracování produktů najednou
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const skip = parseInt(req.nextUrl.searchParams.get('skip') || '0');
    
    console.log(`Generuji embeddingy pro produkty (limit: ${limit}, skip: ${skip})`);
    
    // Načtení produktů z databáze
    const products = await prisma.product.findMany({
      take: limit,
      skip,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true
      }
    });
    
    console.log(`Načteno ${products.length} produktů pro generování embeddingů`);
    
    if (products.length === 0) {
      return NextResponse.json({ message: 'Žádné produkty k zpracování' });
    }
    
    // Zpracování každého produktu
    const results = [];
    
    for (const product of products) {
      try {
        // Vytvoření textu pro embedding
        const productText = [
          product.name || '',
          product.description || '',
          product.category || '',
          ...(typeof product.tags === 'string' 
            ? JSON.parse(product.tags) 
            : Array.isArray(product.tags) 
              ? product.tags 
              : [])
        ].join(' ');
        
        console.log(`Generuji embedding pro produkt ${product.id} (${product.name})`);
        
        // Vytvoření embeddingu
        const embedding = await createEmbedding(productText);
        
        // Uložení embeddingu do databáze
        // Poznámka: Musíme přidat embedding sloupec do databáze nebo vytvořit novou tabulku
        // Pro účely ukázky budeme předpokládat, že sloupec již existuje
        
        // Aktualizace produktu s embeddingem
        /*
        await prisma.product.update({
          where: { id: product.id },
          data: {
            embedding: JSON.stringify(embedding)
          }
        });
        */
        
        // Alternativně můžeme vytvořit novou tabulku pro embeddingy:
        await prisma.$executeRaw`
          INSERT INTO product_embeddings (product_id, embedding, created_at)
          VALUES (${product.id}, ${JSON.stringify(embedding)}, NOW())
          ON CONFLICT (product_id)
          DO UPDATE SET embedding = ${JSON.stringify(embedding)}, updated_at = NOW()
        `;
        
        results.push({
          id: product.id,
          name: product.name,
          success: true
        });
      } catch (error) {
        console.error(`Chyba při zpracování produktu ${product.id}:`, error);
        results.push({
          id: product.id,
          name: product.name,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // Vrácení výsledků
    return NextResponse.json({
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      nextSkip: skip + limit,
      results
    });
    
  } catch (error) {
    console.error('Chyba při generování embeddingů:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 