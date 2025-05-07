import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Inicializace Anthropic (Claude) klienta
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '', // Klíč je potřeba nastavit v .env souboru
});

// Funkce pro extrakci relevantních částí HTML
function extractRelevantContent(html: string): string {
  // Odstranění skriptů, stylů a komentářů pro zmenšení velikosti
  let cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extrakce relevantních sekcí - hledáme hlavní obsahové elementy
  const mainContentMatches = cleanedHtml.match(/<main[^>]*>[\s\S]*?<\/main>/i) || 
                        cleanedHtml.match(/<article[^>]*>[\s\S]*?<\/article>/i) || 
                        cleanedHtml.match(/<div[^>]*id=["']content["'][^>]*>[\s\S]*?<\/div>/i) ||
                        cleanedHtml.match(/<div[^>]*class=["'].*?content.*?["'][^>]*>[\s\S]*?<\/div>/i);

  // Najdeme title stránky
  const titleMatch = cleanedHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleContent = titleMatch ? titleMatch[1] : '';

  // Najdeme meta description
  const descriptionMatch = cleanedHtml.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
  const descriptionContent = descriptionMatch ? descriptionMatch[1] : '';

  // Najdeme meta tagy pro Open Graph a další
  const ogTitleMatch = cleanedHtml.match(/<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i);
  const ogDescriptionMatch = cleanedHtml.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i);
  const ogImageMatch = cleanedHtml.match(/<meta\s+property=["']og:image["']\s+content=["']([\s\S]*?)["']/i);

  // Extrakce ceny (pokud je k dispozici)
  const priceMatches = cleanedHtml.match(/[\$€£][\d,.]+/g) || 
                      cleanedHtml.match(/\b\d+[\.,]?\d*\s*(?:USD|EUR|CZK|Kč)\b/gi);
  
  // Vybudujeme strukturované informace pro AI
  let structuredInfo = `Title: ${titleContent}\n`;
  structuredInfo += `Meta Description: ${descriptionContent}\n`;
  structuredInfo += ogTitleMatch ? `OG Title: ${ogTitleMatch[1]}\n` : '';
  structuredInfo += ogDescriptionMatch ? `OG Description: ${ogDescriptionMatch[1]}\n` : '';
  structuredInfo += ogImageMatch ? `OG Image: ${ogImageMatch[1]}\n` : '';
  
  if (priceMatches && priceMatches.length > 0) {
    structuredInfo += `Potential Prices: ${priceMatches.join(', ')}\n`;
  }

  // Přidáme hlavní obsah, pokud byl nalezen (omezíme na 8000 znaků)
  if (mainContentMatches && mainContentMatches.length > 0) {
    structuredInfo += `\nMain Content Preview:\n${mainContentMatches[0].slice(0, 8000)}`;
  } else {
    // Když nenajdeme hlavní obsah, vezmeme body a omezíme jeho velikost
    const bodyMatch = cleanedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      structuredInfo += `\nPage Content Preview:\n${bodyMatch[1].slice(0, 8000)}`;
    } else {
      // Jako poslední možnost vezmeme jen část celé stránky
      structuredInfo += `\nPage Content Preview:\n${cleanedHtml.slice(0, 8000)}`;
    }
  }

  return structuredInfo;
}

// POST /api/products/scrape - Stáhne data produktu z URL a uloží do databáze
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL adresa je povinná' },
        { status: 400 }
      );
    }

    console.log(`Zpracovávám URL: ${url}`);

    // Kontrola, zda URL již byla zpracována - hledáme podle external URL
    const existingProduct = await prisma.product.findFirst({
      where: {
        externalUrl: url
      }
    });

    if (existingProduct) {
      console.log(`Produkt s URL ${url} již existuje v databázi`);
      return NextResponse.json(
        { 
          message: 'Produkt s touto URL již existuje v databázi',
          product: {
            ...existingProduct,
            tags: JSON.parse(existingProduct.tags || '[]'),
            advantages: JSON.parse(existingProduct.advantages || '[]'),
            disadvantages: JSON.parse(existingProduct.disadvantages || '[]'),
            pricingInfo: JSON.parse(existingProduct.pricingInfo || '{}'),
            videoUrls: JSON.parse(existingProduct.videoUrls || '[]')
          } 
        },
        { status: 200 }
      );
    }

    // Získání obsahu webové stránky
    console.log(`Stahuji obsah stránky: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Chyba při načítání stránky: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`Staženo ${html.length} znaků HTML`);

    // Extrakce relevantních částí HTML
    const relevantContent = extractRelevantContent(html);
    console.log(`Extrahováno ${relevantContent.length} znaků relevantního obsahu`);

    // Zavoláme obecnější URL pro získání informací o doméně a stránce
    const domainName = new URL(url).hostname.replace('www.', '');
    
    // Analýza obsahu pomocí Claude (Anthropic)
    console.log(`Posílám data do Claude pro analýzu`);
    const analysisResponse = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      temperature: 0.2,
      system: `Jsi expert na extrakci strukturovaných dat z webových stránek. Tvým úkolem je analyzovat poskytnuté informace o webové stránce produktu a extrahovat všechny relevantní informace do strukturovaného formátu. 

DŮLEŽITÉ: 
1. Vždy hledej a uváděj jak výhody, tak nevýhody produktu. Pokud nejsou nevýhody přímo uvedeny, snaž se je odvodit z dostupných informací nebo z omezení produktu.
2. Vždy se pokus najít a extrahovat cenové informace - měsíční, roční, případně uvést informace o freemium modelu.
3. Pokud existuje více cenových úrovní, zaznamenej všechny v pricingInfo a uveď do pole 'price' nejnižší placenou částku (ne 0).
4. Vždy hledej omezení produktu, aby nevýhody byly reálné a konkrétní.

Tvým cílem je extrahovat co nejvíce relevantních informací, zejména o cenách a limitech produktu.`,
      messages: [
        {
          role: "user",
          content: `Jedná se o webovou stránku ${domainName} (${url}).

Analyzuj následující extrahovaný obsah z této stránky a vytvoř strukturovaný objekt produktu/služby.

Vrať mi výsledek POUZE v následujícím JSON formátu (nic jiného):
{
  "name": "Název produktu", // Např. může to být "${domainName}" pokud se jedná o hlavní produkt webu
  "description": "Detailní popis produktu",
  "price": 0, // Cena v číselné hodnotě, ne řetězec. Pokud je více cen, uveď základní/nejnižší PLACENOU cenu (ne 0, pokud existuje placená verze)
  "category": "Kategorie produktu", // Např. "Website Builder", "CMS", "E-commerce platform" apod.
  "imageUrl": "URL hlavního obrázku produktu",
  "tags": ["tag1", "tag2"], // Relevantní tagy, klíčová slova
  "advantages": ["výhoda1", "výhoda2"], // POVINNÉ: Výhody produktu - musí být vyplněno
  "disadvantages": ["nevýhoda1", "nevýhoda2"], // POVINNÉ: Nevýhody produktu - musí být vyplněno, i kdyby to bylo odvození z omezení
  "detailInfo": "Podrobné informace o produktu",
  "pricingInfo": {
    "monthly": 0, // Měsíční cena, pokud existuje
    "yearly": 0, // Roční cena, pokud existuje
    "hasFreeTier": true/false, // Zda existuje bezplatná verze
    "currency": "CZK/USD/EUR", // Měna
    "tiers": [
      {"name": "Free", "price": 0, "features": ["feature1", "feature2"]},
      {"name": "Basic", "price": 10, "features": ["feature1", "feature2", "feature3"]},
      {"name": "Pro", "price": 25, "features": ["feature1", "feature2", "feature3", "feature4"]}
    ] // Jednotlivé cenové úrovně, pokud existují
  },
  "videoUrls": ["url1", "url2"], // URL videí o produktu
  "hasTrial": true/false // Zda existuje zkušební verze
}

DŮLEŽITÉ: Zajisti, že budou vyplněna pole advantages (výhody) a disadvantages (nevýhody). Pokud nejsou nevýhody explicitně uvedeny, odvoď je z omezení produktu, jako jsou:
- Omezení ve free verzi
- Nutnost placení za pokročilé funkce
- Technické požadavky nebo limitace
- Složitost použití
- Omezená podpora
- Závislost na konkrétní platformě
- Nedostatek přizpůsobení

Také se zaměř na extrakci co nejpřesnějších cenových informací. Hledej údaje jako "$X/měsíc", "X USD/rok", atd.

Obsah webové stránky:
${relevantContent}`
        }
      ]
    });

    // Extrakce dat z odpovědi Claude
    const analysisContent = analysisResponse.content[0].text;
    let productData;
    
    try {
      // Extrahování JSON z odpovědi (pro případ, že by odpověď obsahovala i nějaký text)
      const jsonMatch = analysisContent?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        productData = JSON.parse(analysisContent || '{}');
      }
    } catch (error) {
      console.error('Chyba při parsování dat z AI:', error);
      console.log('Odpověď AI:', analysisContent);
      return NextResponse.json(
        { error: 'Nepodařilo se zpracovat data z webové stránky' },
        { status: 500 }
      );
    }

    // Zpracování získaných dat před uložením
    const processedData = {
      name: productData.name || domainName,
      description: productData.description || '',
      price: typeof productData.price === 'number' ? productData.price : 0,
      category: productData.category || '',
      imageUrl: productData.imageUrl || '',
      tags: Array.isArray(productData.tags) ? JSON.stringify(productData.tags) : '[]',
      advantages: Array.isArray(productData.advantages) ? JSON.stringify(productData.advantages) : '[]',
      disadvantages: Array.isArray(productData.disadvantages) && productData.disadvantages.length > 0 
        ? JSON.stringify(productData.disadvantages) 
        : JSON.stringify(["Chybí informace o nevýhodách", "Může mít omezení ve funkcionalitě"]),
      detailInfo: productData.detailInfo || '',
      pricingInfo: typeof productData.pricingInfo === 'object' ? JSON.stringify(productData.pricingInfo) : '{}',
      videoUrls: Array.isArray(productData.videoUrls) ? JSON.stringify(productData.videoUrls) : '[]',
      externalUrl: url, // Ukládáme zdrojovou URL
      hasTrial: Boolean(productData.hasTrial)
    };

    console.log(`Ukládám produkt do databáze: ${processedData.name}`);

    // Uložení produktu do databáze
    const product = await prisma.product.create({
      data: processedData
    });

    // Zpracování dat pro odpověď
    const responseProduct = {
      ...product,
      tags: JSON.parse(product.tags || '[]'),
      advantages: JSON.parse(product.advantages || '[]'),
      disadvantages: JSON.parse(product.disadvantages || '[]'),
      pricingInfo: JSON.parse(product.pricingInfo || '{}'),
      videoUrls: JSON.parse(product.videoUrls || '[]')
    };

    console.log(`Produkt úspěšně uložen: ${responseProduct.name}`);

    return NextResponse.json({
      message: 'Produkt byl úspěšně stažen a uložen',
      product: responseProduct
    });
  } catch (error) {
    console.error('Chyba při scrapování produktu:', error);
    return NextResponse.json(
      { error: 'Chyba při scrapování produktu', details: error instanceof Error ? error.message : 'Neznámá chyba' },
      { status: 500 }
    );
  }
} 