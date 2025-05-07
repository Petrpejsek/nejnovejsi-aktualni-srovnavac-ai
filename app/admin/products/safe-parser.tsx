/**
 * Bezpečný parser pro zpracování dat z API
 * Tento soubor obsahuje funkce pro bezpečné zpracování dat z API
 */

/**
 * Bezpečně parsuje JSON string, v případě chyby vrací výchozí hodnotu
 */
export function safeParseJson<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Bezpečně zpracuje pole - pokud není pole, vrací prázdné pole
 */
export function safeArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  return [];
}

/**
 * Bezpečně zpracuje pricingInfo - vrací objekt s výchozími hodnotami v případě chyby
 */
export function safePricingInfo(pricingInfo: any): { basic: string; pro: string; enterprise: string } {
  const defaultValue = { basic: '0', pro: '0', enterprise: '0' };
  
  // Pokud je pricingInfo null nebo undefined
  if (!pricingInfo) return defaultValue;
  
  // Pokud je pricingInfo string, zkusíme ho parsovat jako JSON
  if (typeof pricingInfo === 'string') {
    try {
      const parsed = JSON.parse(pricingInfo);
      return {
        basic: typeof parsed.basic === 'string' ? parsed.basic : '0',
        pro: typeof parsed.pro === 'string' ? parsed.pro : '0',
        enterprise: typeof parsed.enterprise === 'string' ? parsed.enterprise : '0'
      };
    } catch (e) {
      console.error('Error parsing pricingInfo string:', e);
      return defaultValue;
    }
  }
  
  // Pokud je pricingInfo objekt, zkontrolujeme jeho strukturu
  if (typeof pricingInfo === 'object') {
    return {
      basic: typeof pricingInfo.basic === 'string' ? pricingInfo.basic : '0',
      pro: typeof pricingInfo.pro === 'string' ? pricingInfo.pro : '0',
      enterprise: typeof pricingInfo.enterprise === 'string' ? pricingInfo.enterprise : '0'
    };
  }
  
  return defaultValue;
}

/**
 * Bezpečně zpracuje produkt - zajistí, že všechny vlastnosti mají správný formát
 */
export function safeProcessProduct(product: any): any {
  if (!product) return null;
  
  try {
    // Zkusíme parsovat všechny JSON řetězce
    const safeProduct = {
      ...product,
      // Pro pole použijeme safeParseJson s výchozí hodnotou prázdného pole
      tags: safeArray(
        typeof product.tags === 'string' ? safeParseJson(product.tags, []) : product.tags
      ),
      advantages: safeArray(
        typeof product.advantages === 'string' ? safeParseJson(product.advantages, []) : product.advantages
      ),
      disadvantages: safeArray(
        typeof product.disadvantages === 'string' ? safeParseJson(product.disadvantages, []) : product.disadvantages
      ),
      videoUrls: safeArray(
        typeof product.videoUrls === 'string' ? safeParseJson(product.videoUrls, []) : product.videoUrls
      ),
      // Pro pricingInfo použijeme safePricingInfo
      pricingInfo: safePricingInfo(product.pricingInfo),
      // Zajistíme, že price je číslo
      price: typeof product.price === 'number' ? product.price : 0,
      // Zajistíme, že hasTrial je boolean
      hasTrial: typeof product.hasTrial === 'boolean' ? product.hasTrial : false
    };
    
    return safeProduct;
  } catch (error) {
    console.error('Error processing product:', error, product);
    // V případě chyby vrátíme alespoň základní objekt s výchozími hodnotami
    return {
      id: product.id || 'unknown',
      name: product.name || 'Neznámý produkt',
      description: product.description || '',
      price: 0,
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      tags: [],
      advantages: [],
      disadvantages: [],
      detailInfo: product.detailInfo || '',
      pricingInfo: { basic: '0', pro: '0', enterprise: '0' },
      videoUrls: [],
      externalUrl: product.externalUrl || '',
      hasTrial: false
    };
  }
} 