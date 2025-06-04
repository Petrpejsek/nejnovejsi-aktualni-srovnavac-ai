import { OpenAI } from 'openai';

// Inicializace OpenAI API klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Statická cache pro produkty a odpovědi
const productsCache: any[] = [];
const responseCache = new Map<string, { recommendations: any[], timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hodina

// Kontrola API klíče
console.log('OpenAI API klíč je načtený:', process.env.OPENAI_API_KEY ? `Ano (klíč končí na: ${process.env.OPENAI_API_KEY.slice(-4)})` : 'Ne');

/**
 * Funkce pro nastavení produktů do globální cache
 */
export function setProducts(products: any[]) {
  // Vyčistíme cache
  productsCache.length = 0;
  // A přidáme všechny produkty
  productsCache.push(...products);
  console.log(`Nastaveno ${productsCache.length} produktů do globální cache`);
}

/**
 * Rychlé filtrování produktů pro dotaz
 */
function filterProducts(query: string, limit = 20): any[] {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  
  if (keywords.length === 0) return productsCache.slice(0, limit);
  
  // Skóre produktů podle výskytu klíčových slov
  const scoredProducts = productsCache.map(product => {
    const productText = [
      product.name || '',
      product.description || '',
      product.category || '',
      (Array.isArray(product.tags) ? product.tags : []).join(' ')
    ].join(' ').toLowerCase();
    
    let score = 0;
    for (const keyword of keywords) {
      if (productText.includes(keyword)) {
        score += 1;
        
        // Vyšší skóre za přímé shody v názvu
        if ((product.name || '').toLowerCase().includes(keyword)) {
          score += 2;
        }
      }
    }
    
    return { product, score };
  });
  
  // Seřadíme podle skóre a vezmeme jen určitý počet
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
}

/**
 * Funkce pro generování doporučení
 */
export async function generateRecommendations(userQuery: string) {
  try {
    const startTime = Date.now();
    console.log('Začínám generovat doporučení pro dotaz:', userQuery);
    
    // 1. Zkusíme najít v cache
    const cacheKey = userQuery.toLowerCase().trim();
    const now = Date.now();
    
    const cached = responseCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Použití cached doporučení');
      console.log(`Celkový čas: ${Date.now() - startTime}ms`);
      return { recommendations: cached.recommendations };
    }
    
    // 2. Vyfiltrujeme relevantní produkty
    const filteredProducts = filterProducts(userQuery);
    console.log(`Nalezeno ${filteredProducts.length} relevantních produktů`);
    
    if (filteredProducts.length === 0) {
      console.log('Žádné relevantní produkty nenalezeny');
      return { recommendations: [] };
    }
    
    // 3. Připravíme produkty pro prompt
    const productsForPrompt = filteredProducts.map(p => ({
      id: p.id,
      name: p.name || '',
      description: p.description ? p.description.substring(0, 150) : '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : ''
    }));
    
    // 4. Volání OpenAI API
    console.log(`Volám OpenAI API (gpt-4o-mini)...`);
    const apiStart = Date.now();
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are ToolFinder, an AI assistant that recommends the most relevant AI tools for a specific user query.

You will receive:
- a user query describing a problem or use case
- a list of available tools (each with id, name, description, tags)

Your task:
1. Select up to 8 max 10 most relevant tools from the list that best match the user's intent.
2. For each selected tool:
  - Return the \`id\` exactly as provided
  - Return a \`matchPercentage\` as an integer between 80 and 99 based on how relevant the tool is for the query
  - Write a personalized, helpful, and friendly \`recommendation\` (2–3 sentences) explaining why this tool is suitable

Important:
- Base your recommendation only on the provided tool data
- The response must be valid JSON and follow **this exact structure**:

{
  "recommendations": [
    {
      "id": "tool_id",
      "matchPercentage": 93,
      "recommendation": "Why this tool fits the user's request..."
    }
    ...
  ]
}` 
          },
          { 
            role: 'user', 
            content: `Query: ${userQuery}\n\nAvailable tools: ${JSON.stringify(productsForPrompt)}` 
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      
      console.log(`OpenAI API odpověď za ${Date.now() - apiStart}ms`);
      
      // 5. Zpracování odpovědi
      const content = response.choices[0]?.message?.content || '{}';
      let result;
      
      try {
        // Parsování JSON
        result = JSON.parse(content);
        
        // Kontrola formátu
        if (!result.recommendations && result.topProducts) {
          console.log('Použití topProducts místo recommendations');
          result.recommendations = result.topProducts;
        }
        
        if (!result.recommendations || !Array.isArray(result.recommendations)) {
          console.log('Chybějící nebo neplatné pole recommendations v odpovědi:', result);
          return { recommendations: [] };
        }
        
        // Validace a příprava doporučení
        const validRecommendations = [];
        
        for (const rec of result.recommendations) {
          if (!rec || !rec.id) continue;
          
          // Nalezení odpovídajícího produktu
          const product = filteredProducts.find(p => p.id === rec.id);
          if (!product) {
            console.log(`Nenalezen produkt s ID: ${rec.id}`);
            continue;
          }
          
          validRecommendations.push({
            id: rec.id,
            matchPercentage: Math.min(99, Math.max(80, parseInt(String(rec.matchPercentage)) || 90)),
            recommendation: rec.recommendation || '',
            product
          });
        }
        
        // Uložení do cache
        responseCache.set(cacheKey, {
          recommendations: validRecommendations,
          timestamp: now
        });
        
        console.log(`Zpracováno ${validRecommendations.length} platných doporučení`);
        console.log(`Celkový čas: ${Date.now() - startTime}ms`);
        
        return { recommendations: validRecommendations };
      } catch (parseError) {
        console.error('Chyba při zpracování odpovědi z OpenAI:', parseError);
        console.log('Obsah odpovědi:', content);
        return { recommendations: [] }; // Vracíme prázdný výsledek místo vyhození chyby
      }
    } catch (apiError) {
      console.error('Chyba při volání OpenAI API:', apiError);
      return { recommendations: [] }; // Vracíme prázdný výsledek místo vyhození chyby
    }
  } catch (error) {
    console.error('Chyba při generování doporučení:', error);
    return { recommendations: [] }; // Vracíme prázdný výsledek místo vyhození chyby
  }
}

/**
 * Funkce pro vytvoření embeddingu z textu
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Chyba při vytváření embeddingu:', error);
    throw new Error('Nepodařilo se vytvořit embedding');
  }
} 