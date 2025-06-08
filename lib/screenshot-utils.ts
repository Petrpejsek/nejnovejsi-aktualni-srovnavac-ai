/**
 * Utility functions for managing product screenshots
 */

// Mapování názvů produktů na názvy jejich screenshot souborů
const productToScreenshotMap: Record<string, string> = {
  'Anyword': 'anyword_homepage.svg',
  'Brizy.io': 'brizy_homepage.svg', 
  'Kar-go Autonomous Delivery': 'kargo-autonomous-delivery_homepage.svg',
  'ClickUp': 'clickup_homepage.svg',
  'Otter.ai': 'otter_homepage.svg',
  'CoinTracker': 'cointracker_homepage.svg',
  'Notion': 'notion_homepage.svg',
  'Gamma': 'gamma_homepage.svg',
  'Super': 'super_homepage.svg',
  'Poe': 'poe_homepage.svg',
  'Perplexity': 'perplexity_homepage.svg',
  'Claude': 'claude_homepage.svg',
  'ChatGPT': 'chatgpt_homepage.svg',
  'Gemini': 'gemini_homepage.svg',
  'Midjourney': 'midjourney_homepage.svg',
  'DALL-E': 'dalle_homepage.svg',
  'Figma': 'figma_homepage.svg',
  'Canva': 'canva_homepage.svg',
  'Adobe Express': 'adobe-express_homepage.svg',
  'InVideo': 'invideo_homepage.svg',
  'Loom': 'loom_homepage.svg',
  'Calendly': 'calendly_homepage.svg',
  'Typeform': 'typeform_homepage.svg',
  'Mailchimp': 'mailchimp_homepage.svg',
  'HubSpot': 'hubspot_homepage.svg',
  'Salesforce': 'salesforce_homepage.svg',
  'Shopify': 'shopify_homepage.svg',
  'WooCommerce': 'woocommerce_homepage.svg',
  'Stripe': 'stripe_homepage.svg',
  'PayPal': 'paypal_homepage.svg',
  'Voyami': 'voyami_homepage.svg'
};

/**
 * Generuje univerzální placeholder SVG pro nezmapované produkty
 * @param productName - Název produktu
 * @returns SVG jako data URL
 */
export function generatePlaceholderSVG(productName: string): string {
  const displayName = productName.length > 20 ? productName.substring(0, 20) + '...' : productName;
  const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <rect x="0" y="0" width="800" height="80" fill="rgba(255,255,255,0.1)"/>
    <rect x="50" y="20" width="100" height="40" rx="8" fill="rgba(255,255,255,0.2)"/>
    <rect x="200" y="25" width="60" height="30" rx="4" fill="rgba(255,255,255,0.15)"/>
    <rect x="300" y="25" width="80" height="30" rx="4" fill="rgba(255,255,255,0.15)"/>
    <circle cx="650" cy="40" r="20" fill="rgba(255,255,255,0.2)"/>
    <circle cx="700" cy="40" r="20" fill="rgba(255,255,255,0.2)"/>
    <rect x="50" y="120" width="300" height="200" rx="12" fill="rgba(255,255,255,0.1)"/>
    <rect x="400" y="120" width="300" height="200" rx="12" fill="rgba(255,255,255,0.1)"/>
    <rect x="50" y="360" width="650" height="60" rx="8" fill="rgba(255,255,255,0.1)"/>
    <rect x="50" y="460" width="200" height="40" rx="6" fill="rgba(255,255,255,0.2)"/>
    <rect x="280" y="460" width="150" height="40" rx="6" fill="rgba(255,255,255,0.15)"/>
    <text x="400" y="550" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${displayName}</text>
    <text x="400" y="580" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16">Product Screenshot</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
}

/**
 * Generuje URL screenshotu na základě jména produktu
 * @param productName - Název produktu
 * @param fallbackImageUrl - Původní imageUrl z databáze (nepovinné)
 * @returns URL screenshotu nebo fallback
 */
export function getScreenshotUrl(productName: string, fallbackImageUrl?: string | null): string {
  // Kontrola přesného mapování
  if (productToScreenshotMap[productName]) {
    return `/screenshots/${productToScreenshotMap[productName]}`;
  }
  
  // Pokud máme fallback z databáze a odkazuje na screenshot který neexistuje, použijeme placeholder
  if (fallbackImageUrl && fallbackImageUrl.includes('/screenshots/') && !fallbackImageUrl.includes('.svg')) {
    return generatePlaceholderSVG(productName);
  }
  
  // Pokud máme jiný fallback z databáze a není prázdný, použijeme ho
  if (fallbackImageUrl && fallbackImageUrl.trim() && !fallbackImageUrl.includes('/screenshots/')) {
    return fallbackImageUrl;
  }
  
  // Pokus o generování názvu souboru z názvu produktu
  const normalizedName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Odstraní speciální znaky
    .replace(/\s+/g, '-') // Nahradí mezery pomlčkami
    .replace(/-+/g, '-') // Odstraní duplikátní pomlčky
    .trim();
  
  const potentialFilename = `${normalizedName}_homepage.svg`;
  
  // Pokud existuje v mapování (case-insensitive), použijeme ho
  const mappedFile = Object.values(productToScreenshotMap).find(
    file => file.toLowerCase() === potentialFilename.toLowerCase()
  );
  
  if (mappedFile) {
    return `/screenshots/${mappedFile}`;
  }
  
  // Jako poslední možnost vygenerujeme placeholder
  return generatePlaceholderSVG(productName);
}

/**
 * Kontroluje, zda screenshot pro daný produkt existuje
 * @param productName - Název produktu
 * @returns true pokud máme mapování pro tento produkt
 */
export function hasScreenshot(productName: string): boolean {
  return productName in productToScreenshotMap;
}

/**
 * Vrátí seznam všech produktů, které mají screenshoty
 * @returns Pole názvů produktů
 */
export function getProductsWithScreenshots(): string[] {
  return Object.keys(productToScreenshotMap);
}

/**
 * Aktualizuje imageUrl produktu použitím screenshot utility
 * @param product - Objekt produktu
 * @returns Produkt s aktualizovaným imageUrl
 */
export function enhanceProductWithScreenshot<T extends { name: string; imageUrl?: string | null }>(product: T): T {
  return {
    ...product,
    imageUrl: getScreenshotUrl(product.name, product.imageUrl)
  };
} 