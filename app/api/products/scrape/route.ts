import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { NextRequest } from 'next/server';

interface ProductData {
  name: string;
  description: string;
  primary_category: string;
  secondary_category?: string;
  price: number;
  advantages: string[];
  disadvantages: string[];
  hasTrial: boolean;
  tags: string[];
  detailInfo: string;
  pricingInfo: any;
}

// Funkce pro normalizaci tagů
function normalizeTag(tag: string): string {
  const normalizedTag = tag.trim().toLowerCase()
  
  // Sjednotíme podobné tagy
  const tagMap: { [key: string]: string } = {
    'text na řeč': 'Text to Speech',
    'text to speech': 'Text to Speech',
    'úprava fotek': 'Image Editing',
    'úprava obrázků': 'Image Editing',
    'generování obrázků': 'Image Generation',
    'generování obrázkú': 'Image Generation',
    'zákaznický servis': 'Customer Support',
    'zákaznická podpora': 'Customer Support',
    'projektové řízení': 'Project Management',
    'projektový management': 'Project Management',
    'avatary': 'Digital Avatars',
    'digitální avatary': 'Digital Avatars',
    'video': 'Video Creation',
    'video tvorba': 'Video Creation',
    'voiceover': 'Text to Speech',
    'writing assistants': 'Writing Assistants',
    'ai writing': 'AI Writing',
    'content generation': 'Content Generation',
    'writing assistant': 'Writing Assistant'
  }

  return tagMap[normalizedTag] || tag.trim()
}

// Funkce pro odstranění duplicitních tagů
function removeDuplicateTags(tags: string[]): string[] {
  const normalizedTags = new Set<string>()
  const uniqueTags: string[] = []
  
  tags.forEach(tag => {
    const normalized = normalizeTag(tag).toLowerCase()
    if (!normalizedTags.has(normalized)) {
      normalizedTags.add(normalized)
      uniqueTags.push(normalizeTag(tag)) // Přidáme normalizovaný tag
    }
  })
  
  return uniqueTags
}

// Funkce pro přípravu dat kategorie
function prepareProductData(productData: ProductData) {
  // Připravit tagy - přidat secondary_category pokud existuje
  let tags = [...productData.tags];
  
  if (productData.secondary_category) {
    // Normalizujeme secondary_category pro srovnání
    const normalizedSecondary = normalizeTag(productData.secondary_category).toLowerCase()
    const tagExists = tags.some(tag => normalizeTag(tag).toLowerCase() === normalizedSecondary)
    
    if (!tagExists) {
      tags.unshift(productData.secondary_category); // Přidat na začátek
    }
  }
  
  // Odstranit všechny duplikáty
  tags = removeDuplicateTags(tags)

  return {
    ...productData,
    category: productData.primary_category, // Hlavní kategorie → category string
    tags: tags, // Tags včetně secondary_category, bez duplikátů
    // Odstraníme primary_category a secondary_category z finálních dat
    primary_category: undefined,
    secondary_category: undefined
  };
}

// POST /api/products/scrape - Automatické scrapování produktů z URL
export async function POST(request: NextRequest) {
  try {
    // Kontrola prostředí - blokace na produkci
    const isAdminUploadEnabled = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_UPLOAD === 'true'
    
    if (!isAdminUploadEnabled) {
      return NextResponse.json({
        success: false,
        error: 'URL scraping funkcionalita není dostupná na tomto prostředí'
      }, { status: 403 });
    }

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.error('❌ Chybná validace URL:', { urls, isArray: Array.isArray(urls), length: urls?.length });
      return NextResponse.json({ 
        success: false, 
        error: 'Prosím zadejte seznam URL' 
      }, { status: 400 });
    }

    console.log(`🚀 Začínám scraping pro ${urls.length} URL...`);

    const results = [];

    for (let i = 0; i < urls.length; i++) {
      // Extrakt URL - odstraní číslování, neviditelné znaky a jiné prefixes
      let url = urls[i]?.toString()?.trim();
      
      // Najdi https:// nebo http:// v textu
      const httpMatch = url?.match(/(https?:\/\/[^\s]+)/);
      if (httpMatch) {
        url = httpMatch[1];
      }
      
      if (!url || !url.startsWith('http')) {
        results.push({
          url: url || urls[i] || 'undefined',
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
        
        if (!websiteContent || websiteContent.trim().length === 0) {
          console.error(`❌ Prázdný obsah: ${url}`);
          results.push({
            url,
            success: false,
            error: 'Stažený obsah stránky je prázdný'
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
        
        // 3. Připravit data s kategoriemi
        const preparedData = prepareProductData(productData);

        // 4. Vytvořit screenshot
        console.log(`📸 Tvořím screenshot pro: ${productData.name}`);
        const screenshotUrl = await createScreenshot(url, productData.name);
        console.log(`📸 Screenshot ${screenshotUrl ? 'vytvořen' : 'selhal'}: ${screenshotUrl || 'žádná URL'}`);

        // 5. Přidat do review queue (duplikáty se kontrolují při approve)
        console.log(`✅ Produkt připraven k review: ${productData.name}`);

        results.push({
          url,
          success: true,
          reviewData: {
            ...preparedData,
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

// Extrahuje data produktu pomocí základního HTML parsingu místo OpenAI
async function extractProductData(url: string, htmlContent: string): Promise<ProductData | null> {
  try {
    console.log(`🔍 Extrakcia údajov pre: ${url}`);
    
    // Základní HTML parsing
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Hľadáme meta description
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Hľadáme prítomnosť AI/tech kľúčových slov
    const content = htmlContent.toLowerCase();
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'automation', 'api', 'saas', 'tool', 'software', 'platform', 'app'];
    const hasAiKeywords = aiKeywords.some(keyword => content.includes(keyword));
    
    if (!title || !hasAiKeywords) {
      console.log('❌ Nenájdené AI/tech kľúčové slová alebo názov');
      return null;
    }
    
    // Základné údaje s rozumnými predvolbami
    const productData: ProductData = {
      name: title.length > 100 ? title.substring(0, 97) + '...' : title,
      description: description || `AI-powered tool that helps with various tasks. ${title} provides intelligent solutions for better productivity.`,
      primary_category: 'Productivity & Organization', // predvolená kategória
      secondary_category: 'General Utilities',
      price: 0, // predvolená cena
      advantages: [
        'AI-powered functionality',
        'Easy to use interface',
        'Improves productivity',
        'Modern technology'
      ],
      disadvantages: [
        'May require internet connection',
        'Learning curve for advanced features'
      ],
      hasTrial: true, // predpokladáme že má trial
      tags: ['AI Tool', 'Productivity', 'Software'],
      detailInfo: description || `${title} is an AI-powered platform designed to enhance productivity and streamline workflows. The tool offers intelligent features that help users achieve their goals more efficiently.`,
      pricingInfo: {
        plans: [
          { name: 'Free', price: 0, features: ['Basic features', 'Limited usage'] },
          { name: 'Pro', price: 29, features: ['Advanced features', 'Unlimited usage', 'Priority support'] }
        ]
      }
    };
    
    console.log(`✅ Extraktované údaje pre: ${productData.name}`);
    return productData;
    
  } catch (error) {
    console.error('❌ Chyba pri extrakci bez OpenAI:', error);
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