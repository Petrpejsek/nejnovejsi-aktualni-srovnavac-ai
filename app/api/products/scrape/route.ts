import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Inicializace OpenAI klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ProductData {
  name: string;
  description: string;
  category: string;
  price: number;
  advantages: string[];
  disadvantages: string[];
  hasTrial: boolean;
  tags: string[];
  detailInfo: string;
  pricingInfo: any;
}

// POST /api/products/scrape - Automatické scrapování produktů z URL
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prosím zadejte seznam URL' 
      }, { status: 400 });
    }

    console.log(`🚀 Začínám scraping pro ${urls.length} URL...`);

    const results = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      
      if (!url.startsWith('http')) {
        results.push({
          url,
          success: false,
          error: 'Neplatná URL adresa'
        });
        continue;
      }

      console.log(`📄 Zpracovávám ${i + 1}/${urls.length}: ${url}`);

      try {
        // 1. Stáhnout obsah webové stránky
        console.log(`🌐 Stahuji obsah: ${url}`);
        const websiteContent = await fetchWebsiteContent(url);
        
        if (!websiteContent) {
          console.error(`❌ Nepodařilo se stáhnout obsah: ${url}`);
          results.push({
            url,
            success: false,
            error: 'Nepodařilo se stáhnout obsah stránky'
          });
          continue;
        }

        console.log(`📄 Obsah stažen (${websiteContent.length} znaků)`);

        // 2. Extrahovat data pomocí OpenAI
        console.log(`🤖 Volám OpenAI pro extrakci dat...`);
        const productData = await extractProductData(url, websiteContent);
        
        if (!productData) {
          console.error(`❌ OpenAI nevrátilo validní data pro: ${url}`);
          results.push({
            url,
            success: false,
            error: 'Nepodařilo se extrahovat data produktu nebo není AI/tech produkt'
          });
          continue;
        }

        console.log(`✅ Data extrahována: ${productData.name}`);
        

        // 3. Vytvořit screenshot
        console.log(`📸 Tvořím screenshot pro: ${productData.name}`);
        const screenshotUrl = await createScreenshot(url, productData.name);
        console.log(`📸 Screenshot ${screenshotUrl ? 'vytvořen' : 'selhal'}: ${screenshotUrl || 'žádná URL'}`);

        // 4. Přidat do review queue (duplikáty se kontrolují při approve)
        console.log(`✅ Produkt připraven k review: ${productData.name}`);

        results.push({
          url,
          success: true,
          reviewData: {
            ...productData,
            externalUrl: url,
            screenshotUrl,
            scrapedAt: new Date().toISOString(),
            reviewId: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        });

        // Krátká pauza mezi requesty
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Chyba při zpracování ${url}:`, error);
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Neočekávaná chyba'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`🎯 Scraping dokončen: ${successCount} úspěšných, ${failCount} neúspěšných`);

    // Přidat úspěšné produkty do review queue
    const reviewProducts = results
      .filter(r => r.success && r.reviewData)
      .map(r => r.reviewData)

    if (reviewProducts.length > 0) {
      try {
        const reviewResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/review-queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: reviewProducts })
        })

        const reviewResult = await reviewResponse.json()
        
        if (reviewResult.success) {
          console.log(`📝 ${reviewResult.addedCount} produktů přidáno do review queue`)
        } else {
          console.warn(`⚠️ Problém s review queue: ${reviewResult.error}`)
        }
      } catch (error) {
        console.error('❌ Chyba při přidávání do review queue:', error)
      }
    }

    return NextResponse.json({
      success: true,
      totalProcessed: urls.length,
      successCount,
      failCount,
      results,
      reviewQueueAdded: reviewProducts.length
    });

  } catch (error) {
    console.error('❌ Kritická chyba při scrapingu:', error);
    return NextResponse.json({
      success: false,
      error: 'Vnitřní chyba serveru'
    }, { status: 500 });
  }
}

// Stáhne obsah webové stránky
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Oříznutí HTML na prvních 15KB pro AI analýzu
    return html.substring(0, 15000);

  } catch (error) {
    console.warn(`⚠️ Nepodařilo se stáhnout ${url}:`, error);
    return '';
  }
}

// Extrahuje data produktu pomocí OpenAI
async function extractProductData(url: string, htmlContent: string): Promise<ProductData | null> {
  try {
    const prompt = `
Analyzuj následující HTML obsah webové stránky a extrahuj informace o AI/tech produktu nebo službě.

URL: ${url}
HTML obsah: ${htmlContent}

Vrať data ve formátu JSON s těmito poli:
{
  "name": "Název produktu (max 100 znaků)",
  "description": "Krátký popis produktu (2-4 věty)",
  "category": "Kategorie (např. 'AI Tools', 'SaaS', 'Productivity', 'Design Tools', 'Analytics', 'Marketing Tools', 'Developer Tools')",
  "price": číselná hodnota základní ceny (0 pokud je zdarma),
  "advantages": ["výhoda 1", "výhoda 2", "výhoda 3", "výhoda 4"] - 4-6 výhod,
  "disadvantages": ["nevýhoda 1", "nevýhoda 2"] - 1-3 nevýhody,
  "hasTrial": true/false - má zkušební verzi zdarma,
  "tags": ["tag1", "tag2", "tag3"] - relevantní tagy,
  "detailInfo": "Detailní popis produktu a jeho funkcí (3-5 vět)",
  "pricingInfo": {
    "plans": [
      {"name": "Free", "price": 0, "features": ["funkce1", "funkce2"]},
      {"name": "Pro", "price": 29, "features": ["funkce1", "funkce2", "funkce3"]}
    ]
  }
}

DŮLEŽITÉ:
- Všechny texty piš v ANGLIČTINĚ
- Pokud nenajdeš cenu, použij 0
- Buď precizní s názvy a popisy
- Zaměř se na klíčové funkce a výhody
- Ignoruj cookies bannery a reklamy
- Pokud to není AI/tech produkt, vrať null
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Jsi expert na analýzu webových stránek a extrakci dat o tech produktech. Vždy vrátíš validní JSON nebo null."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content?.trim();
    
    if (!content) {
      return null;
    }

    // Čištění odpovědi od markdown bloků
    let cleanContent = content;
    if (cleanContent.includes('```json')) {
      cleanContent = cleanContent.split('```json')[1].split('```')[0];
    } else if (cleanContent.includes('```')) {
      cleanContent = cleanContent.split('```')[1].split('```')[0];
    }

    const productData = JSON.parse(cleanContent.trim());
    
    // Validace dat
    if (!productData.name || !productData.description) {
      return null;
    }

    return productData;

  } catch (error) {
    console.error('❌ Chyba při extrakci dat OpenAI:', error);
    return null;
  }
}

// Vytvoří screenshot homepage
async function createScreenshot(url: string, productName: string): Promise<string | null> {
  try {
    // Volání Python screenshot API (předpokládám že máte endpoint)
    const response = await fetch('http://localhost:5000/screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        filename: `${productName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_homepage.png`
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result.screenshotUrl;
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Screenshot se nepodařilo vytvořit:', error);
    return null;
  }
} 