import { OpenAI } from 'openai';

// Ověříme, že API klíč je načtený
console.log('OpenAI API klíč je načtený:', process.env.OPENAI_API_KEY ? 'Ano (klíč končí na: ' + process.env.OPENAI_API_KEY.slice(-4) + ')' : 'Ne');

// Vytváříme OpenAI klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
}

/**
 * Funkce pro generování doporučení produktů na základě dotazu
 */
export async function generateRecommendations(userQuery: string, products: any[]): Promise<Recommendation[]> {
  try {
    console.log('generateRecommendations: Začátek generování', { 
      productCount: products.length, 
      query: userQuery 
    });

    // Připravíme data o produktech pro OpenAI
    const productsData = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      tags: Array.isArray(product.tags) ? product.tags : [],
      advantages: Array.isArray(product.advantages) ? product.advantages : [],
      disadvantages: Array.isArray(product.disadvantages) ? product.disadvantages : [],
      detailInfo: product.detailInfo
    }));

    // Omezíme množství produktů pro API, ale ne tak striktně - navýšíme limit
    const MAX_PRODUCTS_FOR_OPENAI = 30; // Zvětšujeme počet zpracovávaných produktů
    const limitedProducts = productsData.slice(0, MAX_PRODUCTS_FOR_OPENAI);
    console.log(`generateRecommendations: Používáme ${limitedProducts.length} produktů pro dotaz`);

    const prompt = `
    The customer is looking for an AI tool based on the following request:
    "${userQuery}"

    Please analyze this request and compare it with the following AI tools. Identify tools that could be relevant or helpful for the customer's needs. For each tool, determine a percentage match (between 82-99%) with the customer's requirements and create a personalized recommendation in 2-3 sentences, explaining why this tool might be suitable.

    Instructions for determining the match:
    - Include tools that could be helpful for the user's request, even if the connection is not immediately obvious
    - Be generous with relevance - include tools that might help with some aspect of the user's needs
    - For tools you include, the match should be between 82-99% (never exactly 100% to keep it realistic)
    - Excellent matches should be 92-99%, good matches 87-91%, and potentially useful tools 82-86%
    - In the recommendation, emphasize specific benefits of the tool for the requested task
    - ALL RECOMMENDATIONS MUST BE IN ENGLISH ONLY, never in Czech or any other language

    Available AI tools:
    ${JSON.stringify(limitedProducts, null, 2)}

    Format your response as JSON with the following structure:
    {
      "recommendations": [
        {
          "id": "Product ID",
          "matchPercentage": 97,
          "recommendation": "Personalized recommendation for this tool based on customer requirements."
        }
      ]
    }

    Try to include at least 3-5 tools in your recommendations, sorted by matchPercentage from highest to lowest.
    `;

    console.log('generateRecommendations: Volám OpenAI API...');
    
    try {
      // Voláme OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106", // Použijeme GPT-3.5 Turbo pro rychlou odezvu
        messages: [
          { role: "system", content: "You are an expert AI advisor and marketing specialist who helps customers find the most suitable AI tools for their needs. Your goal is to convince the customer of the usefulness of the recommended tools. All your recommendations must be in English only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }, // Vracet jako JSON
        temperature: 0.7, // Mírně vyšší teplota pro více přesvědčivý tón
        max_tokens: 4000, // Dostatečný prostor pro odpověď
      });

      console.log('generateRecommendations: Odpověď z OpenAI přijata');
      
      // Zpracujeme odpověď
      const content = response.choices[0]?.message?.content || '';
      console.log('OpenAI odpověď:', content.substring(0, 500) + '... (zkráceno)');
      
      try {
        const data = JSON.parse(content);
        console.log(`generateRecommendations: Nalezeno ${data.recommendations?.length || 0} doporučení`);
        
        // Upravíme doporučení, aby odpovídala našim požadavkům
        const processedRecommendations = data.recommendations?.map((rec: Recommendation) => ({
          ...rec,
          // Zajistíme, že procenta jsou v požadovaném rozsahu 82-99%
          matchPercentage: Math.min(99, Math.max(82, rec.matchPercentage))
        })) || [];
        
        return processedRecommendations;
      } catch (parseError) {
        console.error('Chyba při parsování odpovědi z OpenAI:', parseError);
        return [];
      }
    } catch (apiError) {
      console.error('Chyba při volání OpenAI API:', apiError);
      console.error('Detaily chyby:', JSON.stringify(apiError, null, 2));
      return [];
    }
  } catch (error) {
    console.error('Chyba při generování doporučení:', error);
    return [];
  }
} 