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

    const body = await request.json();
    const { urls } = body;

    console.log('🔍 DEBUG: Přijatá data:', { 
      body, 
      urls, 
      urlsType: typeof urls, 
      isArray: Array.isArray(urls), 
      length: urls?.length 
    });

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      console.error('❌ Chybná validace URL:', { urls, isArray: Array.isArray(urls), length: urls?.length });
      return NextResponse.json({ 
        success: false, 
        error: 'Prosím zadejte seznam URL' 
      }, { status: 400 });
    }

    console.log(`🚀 Začínám scraping pro ${urls.length} URL...`);
    console.log('📋 Seznam URL:', urls);

    const results = [];

    for (let i = 0; i < urls.length; i++) {
      console.log(`🔍 DEBUG: Zpracovávám URL ${i + 1}/${urls.length}:`, { originalUrl: urls[i], type: typeof urls[i] });
      
      // Extrakt URL - odstraní číslování, neviditelné znaky a jiné prefixes
      let url = urls[i]?.toString()?.trim();
      
      // Najdi https:// nebo http:// v textu
      const httpMatch = url?.match(/(https?:\/\/[^\s]+)/);
      if (httpMatch) {
        url = httpMatch[1];
      }
      
      console.log(`🔍 DEBUG: Po extrakci:`, { originalUrl: urls[i], extractedUrl: url, startsWithHttp: url?.startsWith('http') });
      
      if (!url || !url.startsWith('http')) {
        console.error(`❌ Neplatná URL ${i + 1}:`, { url, original: urls[i] });
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
  "primary_category": "Hlavní kategorie - vybráno z těchto: 'Content & Writing', 'Meetings & Communication', 'Productivity & Organization', 'Design & Visual', 'Marketing & Social Media', 'Audio & Music', 'Business & Enterprise', 'Developer & Technical', 'Browsing & Utilities'",
  "secondary_category": "Podkategorie - vybráno podle primary_category:
    Content & Writing: 'AI Copywriting', 'Writing Assistants', 'Creative Writing', 'Blog & SEO Content'
    Meetings & Communication: 'Meeting Notes & Transcription', 'Voice & Speech', 'Video Conferencing Tools'
    Productivity & Organization: 'Task Management', 'Note-taking & Knowledge', 'Email & Communication', 'Calendar & Scheduling'
    Design & Visual: 'Presentations', 'Graphic Design', 'Image Generation', 'Video Editing'
    Marketing & Social Media: 'Social Media Management', 'Content Scheduling', 'Analytics & Insights', 'Ad Creation'
    Audio & Music: 'Music Generation', 'Voice Synthesis', 'Audio Editing', 'Podcast Tools'
    Business & Enterprise: 'HR & People Management', 'Sales & CRM', 'Data Analysis', 'Automation'
    Developer & Technical: 'Code Assistants', 'API & Integration', 'Infrastructure'
    Browsing & Utilities: 'Browsers & Extensions', 'Search & Research', 'General Utilities'",
  "price": číselná hodnota základní ceny (0 pokud je zdarma),
  "advantages": ["výhoda 1", "výhoda 2", "výhoda 3", "výhoda 4"] - 4-6 výhod,
  "disadvantages": ["nevýhoda 1", "nevýhoda 2"] - 1-3 nevýhody,
  "hasTrial": true/false - má zkušební verzi zdarma,
  "tags": ["tag1", "tag2", "tag3"] - relevantní tagy (3-5 tagů),
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
- POVINNĚ vybírej primary_category POUZE z uvedeného seznamu
- POVINNĚ vybírej secondary_category POUZE z odpovídající sekce
- Pokud nenajdeš cenu, použij 0
- Buď precizní s názvy a popisy
- Zaměř se na klíčové funkce a výhody
- Ignoruj cookies bannery a reklamy
- Pokud to není AI/tech produkt, vrať null

PŘÍKLADY KATEGORIZACE:
- Writesonic → primary: "Content & Writing", secondary: "AI Copywriting"
- Fireflies.ai → primary: "Meetings & Communication", secondary: "Meeting Notes & Transcription"
- Motion → primary: "Productivity & Organization", secondary: "Task Management"
- Beautiful.ai → primary: "Design & Visual", secondary: "Presentations"
- Buffer → primary: "Marketing & Social Media", secondary: "Social Media Management"
- Suno → primary: "Audio & Music", secondary: "Music Generation"
- Lattice → primary: "Business & Enterprise", secondary: "HR & People Management"
- Arc Browser → primary: "Browsing & Utilities", secondary: "Browsers & Extensions"
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