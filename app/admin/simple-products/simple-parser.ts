/**
 * Zjednodušený bezpečný parser pro zpracování dat z API
 * Tento soubor obsahuje funkce pro bezpečné zpracování dat z API pro jednoduchý seznam produktů
 */

/**
 * Bezpečně zpracuje produkt - zajistí, že všechny vlastnosti mají správný formát
 * Tato funkce je zjednodušená pro jednoduchý seznam produktů a nemá žádné složité parsování JSON
 */
export function safeProcessSimpleProduct(product: any): any {
  if (!product) return null;
  
  try {
    // Vytvoříme nový objekt s pouze potřebnými vlastnostmi a výchozími hodnotami
    return {
      id: product.id || 'unknown',
      name: product.name || 'Neznámý produkt',
      description: product.description || '',
      price: typeof product.price === 'number' ? product.price : 0,
      category: product.category || ''
    };
  } catch (error) {
    console.error('SimpleParser: Error processing product:', error);
    // V případě chyby vrátíme základní objekt
    return {
      id: 'error',
      name: 'Chyba zpracování produktu',
      description: '',
      price: 0,
      category: ''
    };
  }
}

/**
 * Bezpečně zpracuje pole produktů
 */
export function safeProcessProducts(products: any[]): any[] {
  if (!products || !Array.isArray(products)) {
    return [];
  }
  
  return products.map(product => safeProcessSimpleProduct(product));
} 