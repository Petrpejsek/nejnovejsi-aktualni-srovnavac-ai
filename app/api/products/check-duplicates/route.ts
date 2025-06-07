import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Normalizace URL - odstranění koncového lomítka a převod na malá písmena
function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase().trim()
}

// POST /api/products/check-duplicates - Kontrola duplicitních URL
export async function POST(request: NextRequest) {
  try {
    // Kontrola prostředí - blokace na produkci
    const isAdminUploadEnabled = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD === 'true'
    
    if (!isAdminUploadEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Kontrola duplicit není dostupná na tomto prostředí'
      }, { status: 403 });
    }

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prosím zadejte seznam URL' 
      }, { status: 400 });
    }

    console.log(`🔍 Kontroluji duplicity pro ${urls.length} URL...`);

    // Normalizovat všechny URL
    const normalizedUrls = urls.map(url => normalizeUrl(url.trim()))

    // Získat všechny existující URL z databáze
    const existingProducts = await prisma.product.findMany({
      select: {
        externalUrl: true,
        name: true
      },
      where: {
        externalUrl: {
          not: null
        }
      }
    })

    // Normalizovat existující URL z databáze
    const existingNormalizedUrls = new Set(
      existingProducts
        .filter(p => p.externalUrl)
        .map(p => normalizeUrl(p.externalUrl!))
    )

    // Najít duplicity a unikátní URL
    const duplicates: string[] = []
    const uniqueUrls: string[] = []
    const duplicateDetails: Array<{url: string, existingProduct: string}> = []

    for (let i = 0; i < urls.length; i++) {
      const originalUrl = urls[i].trim()
      const normalizedUrl = normalizedUrls[i]
      
      if (existingNormalizedUrls.has(normalizedUrl)) {
        duplicates.push(originalUrl)
        
        // Najít název existujícího produktu
        const existingProduct = existingProducts.find(p => 
          p.externalUrl && normalizeUrl(p.externalUrl) === normalizedUrl
        )
        
        duplicateDetails.push({
          url: originalUrl,
          existingProduct: existingProduct?.name || 'Neznámý produkt'
        })
      } else {
        uniqueUrls.push(originalUrl)
      }
    }

    console.log(`✅ Kontrola dokončena: ${duplicates.length} duplicit, ${uniqueUrls.length} unikátních`);

    return NextResponse.json({
      success: true,
      totalChecked: urls.length,
      duplicatesCount: duplicates.length,
      uniqueCount: uniqueUrls.length,
      duplicates,
      uniqueUrls,
      duplicateDetails
    });

  } catch (error) {
    console.error('❌ Chyba při kontrole duplicit:', error);
    return NextResponse.json({
      success: false,
      error: 'Chyba při kontrole duplicit'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 