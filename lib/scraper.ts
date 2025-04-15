import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { Product } from '@prisma/client';

/**
 * Základní rozhraní pro extrahovaná data o produktu
 */
export interface ScrapedProductData {
  name: string;
  description: string;
  price: number;
  category?: string;
  imageUrl?: string;
  tags?: string[];
  advantages?: string[];
  disadvantages?: string[];
  detailInfo?: string;
  pricingInfo?: any;
  videoUrls?: string[];
  externalUrl: string;
  hasTrial?: boolean;
}

/**
 * Stáhne HTML obsah z dané URL
 */
export async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw error;
  }
}

/**
 * Extrahuje základní informace o produktu z HTML
 */
export async function scrapeProductFromUrl(url: string): Promise<ScrapedProductData> {
  const html = await fetchHtml(url);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Zde extrahujeme základní informace o produktu
  // Toto je obecná implementace, kterou můžete upravit podle potřeby
  
  // Pokusíme se získat název produktu z title nebo h1
  const title = document.querySelector('title')?.textContent || '';
  const h1 = document.querySelector('h1')?.textContent || '';
  const name = h1 || title.split('|')[0].trim();
  
  // Popis produktu - hledáme meta description nebo první odstavec
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const firstParagraph = document.querySelector('p')?.textContent || '';
  const description = metaDescription || firstParagraph;
  
  // Obrázek produktu - hledáme první velký obrázek nebo meta image
  const metaImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
  const firstImage = document.querySelector('img[src*="product"]')?.getAttribute('src') || 
                     document.querySelector('img[alt*="product"]')?.getAttribute('src') || 
                     document.querySelector('img[alt*="logo"]')?.getAttribute('src') || 
                     document.querySelector('img')?.getAttribute('src');
  const imageUrl = metaImage || firstImage || '';
  
  // Cena - hledáme něco, co vypadá jako cena
  let price = 0;
  const priceText = document.querySelector('.price')?.textContent || 
                    document.querySelector('[class*="price"]')?.textContent || 
                    document.querySelector('[id*="price"]')?.textContent || '';
  
  if (priceText) {
    // Extrahujeme čísla z textu
    const priceMatch = priceText.match(/(\d+(\.\d+)?)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[0]);
    }
  }
  
  // Výhody produktu - hledáme seznamy s pozitivními klíčovými slovy
  const advantagesList = Array.from(document.querySelectorAll('li'))
    .filter(li => {
      const text = li.textContent?.toLowerCase() || '';
      return text.includes('benefit') || text.includes('advantage') || 
             text.includes('pro') || text.includes('feature');
    })
    .map(li => li.textContent?.trim() || '')
    .filter(text => text.length > 0);
  
  // Kategorie - pokusíme se odhadnout z breadcrumbs nebo nadpisů
  const breadcrumbs = document.querySelector('.breadcrumbs')?.textContent || 
                      document.querySelector('[class*="breadcrumb"]')?.textContent || '';
  const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim() || '');
  
  // Výsledná datová struktura
  return {
    name,
    description,
    price,
    category: breadcrumbs || h2s[0] || '',
    imageUrl: imageUrl ? new URL(imageUrl, url).href : undefined,
    advantages: advantagesList.length > 0 ? advantagesList : undefined,
    externalUrl: url,
    hasTrial: html.toLowerCase().includes('trial') || html.toLowerCase().includes('free') || false
  };
}

/**
 * Převede scrapovaná data na formát vhodný pro uložení do databáze
 */
export function formatProductForDatabase(data: ScrapedProductData): Partial<Product> {
  return {
    name: data.name,
    description: data.description || '',
    price: data.price,
    category: data.category || null,
    imageUrl: data.imageUrl || null,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    advantages: data.advantages ? JSON.stringify(data.advantages) : null,
    disadvantages: data.disadvantages ? JSON.stringify(data.disadvantages) : null,
    detailInfo: data.detailInfo || null,
    pricingInfo: data.pricingInfo ? JSON.stringify(data.pricingInfo) : null,
    videoUrls: data.videoUrls ? JSON.stringify(data.videoUrls) : null,
    externalUrl: data.externalUrl,
    hasTrial: data.hasTrial || false
  };
} 