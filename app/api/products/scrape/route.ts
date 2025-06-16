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
    // Kontrola prostředí - povolení scrapingu a screenshotů
    const isAdminUploadEnabled = true; // Povolíme vždy, protože potřebujeme obojí
    
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

// Extrahuje data produktu pomocí OpenAI pro přesnou analýzu
async function extractProductData(url: string, htmlContent: string): Promise<ProductData | null> {
  try {
    console.log(`🔍 Extrakcia údajov pre: ${url}`);
    
    // Nejdříve základní HTML parsing pro název
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const fullTitle = titleMatch ? titleMatch[1].trim() : '';
    
    // Vyčistíme název produktu
    let cleanTitle = fullTitle;
    cleanTitle = cleanTitle.split(/\s*[\|\-\–\—]\s*/)[0];
    if (cleanTitle.includes(':') && cleanTitle.length > 50) {
      cleanTitle = cleanTitle.split(':')[0];
    }
    cleanTitle = cleanTitle.replace(/\s*(homepage|home|official site|website|site|page)$/i, '');
    cleanTitle = cleanTitle.replace(/\s*\([^)]{20,}\)$/i, '');
    if (cleanTitle.length > 60) {
      cleanTitle = cleanTitle.substring(0, 57) + '...';
    }
    const title = cleanTitle.trim() || fullTitle.trim();
    
    // Meta description
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : '';
    
    // Kontrola AI/tech klíčových slov
    const content = htmlContent.toLowerCase();
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'automation', 'api', 'saas', 'tool', 'software', 'platform', 'app', 'service', 'solution'];
    const hasAiKeywords = aiKeywords.some(keyword => content.includes(keyword));
    
    if (!title) {
      console.log('❌ Nenájdený názov produktu');
      return null;
    }
    
    // Použijeme OpenAI pro přesnou analýzu obsahu
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `CRITICAL: Analyze this website and determine if it's an AI-powered tool/software/platform. We ONLY accept AI tools, not regular software, games, entertainment, or non-AI services.

AI TOOLS INCLUDE:
- Machine learning platforms
- AI writing assistants
- AI image/video generators
- AI chatbots and virtual assistants
- AI analytics and data tools
- AI automation platforms
- AI-powered business tools
- AI development frameworks
- AI APIs and services

NOT AI TOOLS (REJECT):
- Regular games/gaming platforms
- Sports streaming services
- Entertainment platforms
- Regular business software without AI
- E-commerce platforms
- Social media platforms
- Regular productivity tools
- Hardware products
- Non-AI SaaS tools

Return ONLY valid JSON:

{
  "name": "Product name",
  "description": "Brief description (1-2 sentences)",
  "primary_category": "AI category",
  "secondary_category": "Secondary AI category or null",
  "price": 0,
  "advantages": ["AI-specific advantage1", "advantage2", "advantage3"],
  "disadvantages": ["disadvantage1", "disadvantage2"],
  "hasTrial": true/false,
  "tags": ["AI-related tag1", "tag2", "tag3"],
  "detailInfo": "Detailed description focusing on AI capabilities",
  "isAiTool": true/false,
  "aiConfidenceScore": 0-100
}

Website: ${url}
Title: ${title}
Meta Description: ${metaDescription}
Content: ${htmlContent.substring(0, 3000)}

IMPORTANT: Set isAiTool to true ONLY if this is genuinely an AI-powered tool. Set aiConfidenceScore (0-100) based on how confident you are it's an AI tool.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an AI tool specialist. Your job is to identify ONLY genuine AI-powered tools and reject everything else. Be very strict - only accept tools that actually use artificial intelligence, machine learning, or AI algorithms. Reject games, entertainment, regular software, and non-AI services."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        });

        const aiResponse = completion.choices[0]?.message?.content;
        if (aiResponse) {
          const aiData = JSON.parse(aiResponse);
          
          // Velmi přísné filtrování - musí být AI tool s vysokou jistotou
          if (!aiData.isAiTool || (aiData.aiConfidenceScore && aiData.aiConfidenceScore < 70)) {
            console.log(`❌ Není AI nástroj - isAiTool: ${aiData.isAiTool}, confidence: ${aiData.aiConfidenceScore}%`);
            return null;
          }
          
          const productData: ProductData = {
            name: aiData.name || title,
            description: aiData.description || metaDescription,
            primary_category: aiData.primary_category || 'General Tools',
            secondary_category: aiData.secondary_category,
            price: aiData.price || 0,
            advantages: aiData.advantages || ['Easy to use', 'Good functionality'],
            disadvantages: aiData.disadvantages || ['May require learning'],
            hasTrial: aiData.hasTrial !== undefined ? aiData.hasTrial : true,
            tags: aiData.tags || ['Software'],
            detailInfo: aiData.detailInfo || aiData.description || metaDescription,
            pricingInfo: {
              plans: [
                { name: 'Free', price: 0, features: ['Basic features'] },
                { name: 'Pro', price: aiData.price || 29, features: ['Advanced features'] }
              ]
            }
          };
          
          console.log(`✅ OpenAI extraktované údaje pre: ${productData.name}`);
          return productData;
        }
      } catch (openaiError) {
        console.warn('⚠️ OpenAI extrakce selhala, použiji fallback:', openaiError);
      }
    }
    
    // Fallback - velmi přísná kontrola AI klíčových slov
    const strictAiKeywords = [
      'artificial intelligence', 'machine learning', 'ai-powered', 'ai-driven', 
      'neural network', 'deep learning', 'natural language processing', 'nlp',
      'computer vision', 'ai assistant', 'ai chatbot', 'ai automation',
      'ai analytics', 'ai generator', 'ai writer', 'ai tool'
    ];
    
    const hasStrictAiKeywords = strictAiKeywords.some(keyword => 
      content.includes(keyword) || metaDescription.toLowerCase().includes(keyword)
    );
    
    if (!hasStrictAiKeywords) {
      console.log('❌ Není AI nástroj (fallback - chybí AI klíčová slova)');
      return null;
    }
    
    const productData: ProductData = {
      name: title,
      description: metaDescription || `${title} - Digital platform and service`,
      primary_category: 'General Tools',
      secondary_category: 'Software',
      price: 0,
      advantages: ['User-friendly interface', 'Good functionality', 'Regular updates'],
      disadvantages: ['May require internet connection', 'Learning curve for new users'],
      hasTrial: true,
      tags: ['Software', 'Tool'],
      detailInfo: metaDescription || `${title} provides digital solutions and services.`,
      pricingInfo: {
        plans: [
          { name: 'Basic', price: 0, features: ['Basic features'] },
          { name: 'Premium', price: 29, features: ['Advanced features'] }
        ]
      }
    };
    
    console.log(`✅ Fallback extraktované údaje pre: ${productData.name}`);
    return productData;
    
  } catch (error) {
    console.error('❌ Chyba pri extrakci:', error);
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