import { OpenAI } from 'openai';

// Vytvoříme OpenAI klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Jednoduché rozhraní pro doporučení
interface SimpleRecommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
}

/**
 * Jednoduchá funkce pro filtrování produktů podle dotazu
 */
function findRelevantProducts(query: string, products: any[], limit = 5) {
  console.log(`Hledám produkty pro dotaz: "${query}"`);
  
  // Bez dotazu vrátíme prvních 5 produktů
  if (!query || query.trim() === '') {
    return products.slice(0, limit);
  }
  
  // Vyhledáme produkty podle klíčových slov
  const searchQuery = query.toLowerCase().trim();
  const relevantProducts = products
    .map(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      
      // Jednoduché bodování
      let score = 0;
      
      if (name.includes(searchQuery) || description.includes(searchQuery)) {
        score += 5;
      }
      
      // Hledáme jednotlivá slova
      const words = searchQuery.split(/\s+/);
      for (const word of words) {
        if (word.length > 2) {
          if (name.includes(word)) score += 3;
          if (description.includes(word)) score += 2;
          if (category.includes(word)) score += 1;
        }
      }
      
      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  // Vrátíme až 5 nejrelevantnějších produktů
  const filteredProducts = relevantProducts.slice(0, limit).map(item => item.product);
  
  // Pokud jsme nenašli žádné produkty, vrátíme prvních 5 ze všech
  if (filteredProducts.length === 0) {
    console.log(`Pro dotaz "${query}" nebyly nalezeny žádné produkty, vracím první produkty`);
    return products.slice(0, limit);
  }
  
  console.log(`Pro dotaz "${query}" nalezeno ${filteredProducts.length} produktů`);
  return filteredProducts;
}

export const systemPromptRecommender = `You are an AI tools expert and advisor for selecting the right technologies. Analyze the user's query and select 5-8 most relevant tools from the provided list.

For each selected tool, create:
1. Match score (85-99%) - how well the tool meets the requirements
2. Personalized recommendation (2-3 sentences in English)
3. Main benefits for the specific use case

Return your response as JSON with the key 'recommendations'.`;

/**
 * Jednoduchá funkce pro generování doporučení produktů
 */
export async function getSimpleRecommendations(query: string, products: any[]): Promise<SimpleRecommendation[]> {
  try {
    console.log(`Generuji doporučení pro dotaz: "${query}"`);
    
    // 1. Najdeme relevantní produkty
    const relevantProducts = findRelevantProducts(query, products);
    console.log(`Filtrováno na ${relevantProducts.length} produktů`);
    
    if (relevantProducts.length === 0) {
      return [];
    }
    
    // 2. Připravíme prompt pro OpenAI
    const prompt = `
User query: "${query}"

Available tools:
${relevantProducts.map((p, i) => `${i+1}. ID: ${p.id}
Name: ${p.name}
Category: ${p.category || 'General'}
Description: ${p.description || 'No description'}`).join('\n\n')}

Please select the 2-3 most relevant tools for this query. 
For each tool provide:
1. The tool ID
2. A match percentage (0-100)
3. A detailed recommendation (2-3 sentences)

Your response must be in this exact JSON format:
{
  "recommendations": [
    {
      "id": "tool-id-here",
      "matchPercentage": 85,
      "recommendation": "This tool is relevant because... It offers features like... Its unique value is..."
    }
  ]
}

Always respond in English. Respond only with valid JSON.
`;
    
    // 3. Pošleme dotaz na OpenAI
    console.log('Volám OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "You are an AI tool recommendation assistant. Always respond in well-formatted JSON only."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1000
    });
    
    // 4. Zpracujeme odpověď
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('OpenAI vrátila prázdnou odpověď');
      return [];
    }
    
    console.log('Odpověď od OpenAI:', content);
    
    // 5. Parsujeme JSON
    let data;
    try {
      data = JSON.parse(content);
    } catch (error) {
      console.error('Chyba při parsování JSON:', error);
      console.error('Původní odpověď:', content);
      return [];
    }
    
    // 6. Validujeme doporučení
    if (!data || !data.recommendations || !Array.isArray(data.recommendations)) {
      console.error('Neplatný formát odpovědi:', data);
      return [];
    }
    
    // 7. Validujeme jednotlivá doporučení
    const validIds = new Set(relevantProducts.map(p => p.id));
    const validRecommendations = data.recommendations
      .filter((rec: any) => rec && typeof rec === 'object' && validIds.has(rec.id))
      .map((rec: any) => ({
        id: rec.id,
        matchPercentage: Math.min(100, Math.max(0, parseInt(rec.matchPercentage) || 0)),
        recommendation: String(rec.recommendation || '')
      }));
    
    console.log(`Zpracováno ${validRecommendations.length} platných doporučení`);
    return validRecommendations;
    
  } catch (error) {
    console.error('Chyba při generování doporučení:', error);
    return [];
  }
}

/**
 * Funkce pro generování doporučení AI nástrojů s novým anglickým promptem
 */
export async function getAiToolRecommendations(query: string, products: any[]): Promise<any> {
  try {
    console.log(`Generating AI tool recommendations for query: "${query}"`);
    
    // 1. Najdeme relevantní produkty
    const relevantProducts = findRelevantProducts(query, products, 10);
    console.log(`Filtered to ${relevantProducts.length} products`);
    
    if (relevantProducts.length === 0) {
      return { recommendations: [] };
    }
    
    // 2. Připravíme produkty pro prompt
    const productsContext = relevantProducts.map((p, i) => `
Tool ${i+1}:
ID: ${p.id}
Name: ${p.name}
Category: ${p.category || 'General'}
Description: ${p.description || 'No description'}
${p.advantages ? `Advantages: ${Array.isArray(p.advantages) ? p.advantages.join(', ') : p.advantages}` : ''}
${p.tags ? `Tags: ${Array.isArray(p.tags) ? p.tags.join(', ') : p.tags}` : ''}
`).join('\n');
    
    // 3. Pošleme dotaz na OpenAI
    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: systemPromptRecommender
        },
        { 
          role: "user", 
          content: `User query: "${query}"\n\nAvailable tools:\n${productsContext}` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500
    });
    
    // 4. Zpracujeme odpověď
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('OpenAI returned an empty response');
      return { recommendations: [] };
    }
    
    console.log('Response from OpenAI:', content);
    
    // 5. Parsujeme JSON
    let data;
    try {
      data = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Original response:', content);
      return { recommendations: [] };
    }
    
    // 6. Validujeme odpověď
    if (!data || !data.recommendations || !Array.isArray(data.recommendations)) {
      console.error('Invalid response format:', data);
      return { recommendations: [] };
    }
    
    return data;
    
  } catch (error) {
    console.error('Error generating AI tool recommendations:', error);
    return { recommendations: [] };
  }
} 