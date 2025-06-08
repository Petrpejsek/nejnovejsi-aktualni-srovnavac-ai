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
  
  // Pokud máme fallback z databáze a není prázdný, použijeme ho
  if (fallbackImageUrl && fallbackImageUrl.trim()) {
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
  
  // Jako poslední možnost vygenerujeme cestu
  return `/screenshots/${potentialFilename}`;
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