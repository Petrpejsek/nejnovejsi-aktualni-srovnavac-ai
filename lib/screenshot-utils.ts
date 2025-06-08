/**
 * Utility functions for managing product screenshots
 */

// Base URL for screenshots CDN (můžeme změnit podle zvolené služby)
const SCREENSHOTS_CDN_BASE = process.env.NEXT_PUBLIC_SCREENSHOTS_CDN || '';

// Mapování názvů produktů na názvy jejich screenshot souborů
const productToScreenshotMap: Record<string, string> = {
  'Anyword': 'anyword_homepage.png',
  'Brizy.io': 'brizy_homepage.png', 
  'Kar-go Autonomous Delivery': 'kargo-autonomous-delivery_homepage.png',
  'ClickUp': 'clickup_homepage.png',
  'Otter.ai': 'otter_homepage.png',
  'CoinTracker': 'cointracker_homepage.png',
  'Notion': 'notion_homepage.png',
  'Gamma': 'gamma_homepage.png',
  'Super': 'super_homepage.png',
  'Poe': 'poe_homepage.png',
  'Perplexity': 'perplexity_homepage.png',
  'Claude': 'claude_homepage.png',
  'ChatGPT': 'chatgpt_homepage.png',
  'Gemini': 'gemini_homepage.png',
  'Midjourney': 'midjourney_homepage.png',
  'DALL-E': 'dalle_homepage.png',
  'Figma': 'figma_homepage.png',
  'Canva': 'canva_homepage.png',
  'Adobe Express': 'adobe-express_homepage.png',
  'InVideo': 'invideo_homepage.png',
  'Loom': 'loom_homepage.png',
  'Calendly': 'calendly_homepage.png',
  'Typeform': 'typeform_homepage.png',
  'Mailchimp': 'mailchimp_homepage.png',
  'HubSpot': 'hubspot_homepage.png',
  'Salesforce': 'salesforce_homepage.png',
  'Shopify': 'shopify_homepage.png',
  'WooCommerce': 'woocommerce_homepage.png',
  'Stripe': 'stripe_homepage.png',
  'PayPal': 'paypal_homepage.png',
  'Voyami': 'voyami_homepage.png'
};

// Seznam produktů, které mají skutečné screenshoty nahrané na CDN
const productsWithRealScreenshots = new Set([
  'Anyword', 'Brizy.io', 'ClickUp', 'Notion', 'ChatGPT', 'Figma', 'Canva'
  // Postupně přidáme další produkty jak budeme nahrávat screenshoty
]);

/**
 * Generuje URL pro screenshot produktu
 */
export function getScreenshotUrl(productName: string): string {
  const filename = productToScreenshotMap[productName];
  
  // Pokud máme skutečný screenshot na CDN
  if (filename && productsWithRealScreenshots.has(productName) && SCREENSHOTS_CDN_BASE) {
    return `${SCREENSHOTS_CDN_BASE}/${filename}`;
  }
  
  // Fallback na lokální SVG placeholder
  if (filename) {
    return `/screenshots/${filename.replace('.png', '.svg')}`;
  }
  
  // Univerzální fallback placeholder
  return generateSVGPlaceholder(productName);
}

/**
 * Ověří, zda produkt má skutečný screenshot
 */
export function hasRealScreenshot(productName: string): boolean {
  return productsWithRealScreenshots.has(productName);
}

/**
 * Přidá produkt do seznamu s skutečnými screenshoty
 */
export function markProductAsHavingRealScreenshot(productName: string): void {
  productsWithRealScreenshots.add(productName);
}

/**
 * Generuje SVG placeholder pro produkt
 */
function generateSVGPlaceholder(productName: string): string {
  const displayName = productName.charAt(0).toUpperCase() + productName.slice(1).replace(/-/g, ' ');
  
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect x="50" y="80" width="700" height="60" rx="8" fill="#ffffff" opacity="0.9"/>
    <rect x="50" y="160" width="500" height="20" rx="4" fill="#ffffff" opacity="0.7"/>
    <rect x="50" y="200" width="600" height="20" rx="4" fill="#ffffff" opacity="0.7"/>
    <rect x="50" y="240" width="400" height="20" rx="4" fill="#ffffff" opacity="0.7"/>
    <text x="400" y="125" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#333333">${displayName}</text>
    <text x="400" y="350" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#ffffff" opacity="0.8">Náhled není k dispozici</text>
    <rect x="300" y="400" width="200" height="100" rx="8" fill="#ffffff" opacity="0.2"/>
    <circle cx="320" cy="420" r="8" fill="#ffffff" opacity="0.5"/>
    <rect x="340" y="415" width="140" height="8" rx="4" fill="#ffffff" opacity="0.5"/>
    <rect x="340" y="430" width="100" height="6" rx="3" fill="#ffffff" opacity="0.4"/>
  </svg>`;
  
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  } catch (error) {
    console.warn('Failed to generate SVG placeholder for:', productName, error);
    // Fallback na jednoduché SVG bez base64
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}

/**
 * Rozšiřuje produkt o screenshot URL
 */
export function enhanceProductWithScreenshot<T extends { name: string; imageUrl?: string }>(product: T): T & { imageUrl: string } {
  // Pokud už má imageUrl a je to skutečný screenshot (ne starý neexistující)
  if (product.imageUrl && !product.imageUrl.includes('/screenshots/')) {
    // Ponech externí URL (CDN, atd.)
    return {
      ...product,
      imageUrl: product.imageUrl
    };
  }
  
  // Pro screenshots/ cesty nebo null/undefined, vygeneruj novou URL
  return {
    ...product,
    imageUrl: getScreenshotUrl(product.name)
  };
} 