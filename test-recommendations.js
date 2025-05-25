import { OpenAI } from 'openai';
import fs from 'fs';

// Načtení API klíče z .env souboru
const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envFile.match(/OPENAI_API_KEY="([^"]+)"/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

console.log('OpenAI API klíč je načtený:', apiKey ? 'Ano (klíč končí na: ' + apiKey.slice(-4) + ')' : 'Ne');

// Vytvoření klienta
const openai = new OpenAI({
  apiKey: apiKey,
});

// Testovací produkty
const products = [
  {
    id: "jasper123",
    name: "Jasper",
    description: "AI asistent pro psaní obsahu",
    category: "content-creation",
    price: 49,
    tags: ["psaní", "AI", "obsah", "marketing"],
    advantages: ["Snadné použití", "Kvalitní výstupy", "Podpora češtiny"],
    disadvantages: ["Vyšší cena", "Občas nepřesné výsledky"],
    detailInfo: "Jasper je populární AI nástroj pro psaní obsahu"
  },
  {
    id: "chatgpt456",
    name: "ChatGPT",
    description: "Konverzační AI pro rozhovor a generování textů",
    category: "chatbot",
    price: 20,
    tags: ["konverzace", "AI", "psaní"],
    advantages: ["Univerzální použití", "Nízká cena", "Široké znalosti"],
    disadvantages: ["Občas halucinuje", "Omezené znalosti po 2021"],
    detailInfo: "ChatGPT je populární chatovací AI od OpenAI"
  },
  {
    id: "wordpress789",
    name: "WordPress AI",
    description: "AI asistent pro WordPress",
    category: "website-builder",
    price: 15,
    tags: ["web", "WordPress", "design"],
    advantages: ["Jednoduchá integrace", "Automatizace", "Přívětivé UI"],
    disadvantages: ["Funguje jen s WordPress", "Základní funkce"],
    detailInfo: "WordPress AI je rozšíření pro populární CMS WordPress"
  }
];

// Funkce pro generování doporučení (podobně jako v lib/openai.ts)
async function generateRecommendations(userQuery, products) {
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
    ${JSON.stringify(productsData, null, 2)}

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

    Try to include at least 3 tools in your recommendations, sorted by matchPercentage from highest to lowest.
    `;

    console.log('generateRecommendations: Volám OpenAI API...');
    console.log('Prompt:', prompt.substring(0, 200) + '...');
    
    try {
      // Voláme OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert AI advisor and marketing specialist who helps customers find the most suitable AI tools for their needs. Your goal is to convince the customer of the usefulness of the recommended tools. All your recommendations must be in English only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000,
      });

      console.log('generateRecommendations: Odpověď z OpenAI přijata');
      
      // Zpracujeme odpověď
      const content = response.choices[0]?.message?.content || '';
      console.log('OpenAI odpověď:', content);
      
      try {
        const data = JSON.parse(content);
        console.log(`generateRecommendations: Nalezeno ${data.recommendations?.length || 0} doporučení`);
        
        // Upravíme doporučení, aby odpovídala našim požadavkům
        const processedRecommendations = data.recommendations?.map((rec) => ({
          ...rec,
          // Zajistíme, že procenta jsou v požadovaném rozsahu 82-99%
          matchPercentage: Math.min(99, Math.max(82, rec.matchPercentage))
        })) || [];
        
        return processedRecommendations;
      } catch (parseError) {
        console.error('Chyba při parsování odpovědi z OpenAI:', parseError);
        console.error('Kompletní odpověď z OpenAI:', content);
        return [];
      }
    } catch (apiError) {
      console.error('Chyba při volání OpenAI API:', apiError);
      console.error('Detaily chyby:', typeof apiError === 'object' ? JSON.stringify(apiError, null, 2) : apiError);
      if (apiError instanceof Error) {
        console.error('Error name:', apiError.name);
        console.error('Error message:', apiError.message);
        console.error('Error stack:', apiError.stack);
      }
      return [];
    }
  } catch (error) {
    console.error('Chyba při generování doporučení:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
}

// Test s jednoduchým dotazem
async function testRecommendations() {
  try {
    console.log('Testování doporučení...');
    const query = "Potřebuji nástroj pro psaní blogových článků";
    const recommendations = await generateRecommendations(query, products);
    
    console.log('Výsledek:', recommendations);
  } catch (error) {
    console.error('Chyba při testování:', error);
  }
}

// Spustit test
testRecommendations(); 