import fs from 'fs';
import { OpenAI } from 'openai';

// Načtení API klíče z .env souboru
const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envFile.match(/OPENAI_API_KEY="([^"]+)"/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

// Vytvoření klienta
const openai = new OpenAI({
  apiKey: apiKey,
});

// Simulace zpracování doporučení
async function testApi() {
  try {
    console.log('Spouštím test API...');
    
    // Testovací data
    const testQuery = 'Potřebuji nástroj pro psaní obsahu';
    
    // Vytvoření testovacích produktů (podobně jako v generateRecommendations)
    const testProducts = [
      {
        id: 'jasper123',
        name: 'Jasper',
        description: 'AI nástroj pro psaní obsahu',
        category: 'content-creation',
        price: 49,
        tags: JSON.stringify(['psaní', 'AI', 'obsah']),
        advantages: JSON.stringify(['Rychlé psaní', 'Kvalitní obsah', 'SEO optimalizace']),
        disadvantages: JSON.stringify(['Vyšší cena', 'Občasné chyby']),
        detailInfo: 'Jasper je oblíbený nástroj pro psaní blogů, článků a dalšího obsahu.'
      },
      {
        id: 'chatgpt456',
        name: 'ChatGPT',
        description: 'Konverzační AI pro všestranné využití',
        category: 'chatbot',
        price: 20,
        tags: JSON.stringify(['konverzace', 'AI', 'psaní']),
        advantages: JSON.stringify(['Široké znalosti', 'Nízká cena', 'Všestrannost']),
        disadvantages: JSON.stringify(['Občas nepřesné', 'Limitované znalosti']),
        detailInfo: 'ChatGPT je generativní AI schopná psát různé druhy textů.'
      }
    ];
    
    // Simulace zpracování produktů
    const processedProducts = testProducts.map(product => ({
      ...product,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
      advantages: typeof product.advantages === 'string' ? JSON.parse(product.advantages) : product.advantages,
      disadvantages: typeof product.disadvantages === 'string' ? JSON.parse(product.disadvantages) : product.disadvantages
    }));
    
    // Příprava dat pro OpenAI
    const prompt = `
    The customer is looking for an AI tool based on the following request:
    "${testQuery}"

    Please analyze this request and compare it with the following AI tools. Identify tools that could be relevant or helpful for the customer's needs. For each tool, determine a percentage match (between 82-99%) with the customer's requirements and create a personalized recommendation in 2-3 sentences, explaining why this tool might be suitable.

    Instructions for determining the match:
    - Include tools that could be helpful for the user's request, even if the connection is not immediately obvious
    - Be generous with relevance - include tools that might help with some aspect of the user's needs
    - For tools you include, the match should be between 82-99% (never exactly 100% to keep it realistic)
    - Excellent matches should be 92-99%, good matches 87-91%, and potentially useful tools 82-86%
    - In the recommendation, emphasize specific benefits of the tool for the requested task
    - ALL RECOMMENDATIONS MUST BE IN ENGLISH ONLY, never in Czech or any other language

    Available AI tools:
    ${JSON.stringify(processedProducts, null, 2)}

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

    Try to include all relevant tools in your recommendations, sorted by matchPercentage from highest to lowest.
    `;
    
    // Log použitých modelů
    const availableModels = await openai.models.list();
    console.log('Dostupné modely:');
    availableModels.data.slice(0, 10).forEach((model, index) => {
      console.log(`${index + 1}. ${model.id} (${model.created})`);
    });
    
    console.log('\nVolám OpenAI API...');
    // Volání OpenAI API
    try {
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
      
      console.log('Odpověď z OpenAI:');
      console.log(JSON.stringify(response, null, 2));
      
      const content = response.choices[0]?.message?.content || '';
      console.log('\nObsah odpovědi:');
      console.log(content);
      
      try {
        const data = JSON.parse(content);
        console.log('\nParsovaná data:');
        console.log(data);
      } catch (parseError) {
        console.error('Chyba při parsování JSON:', parseError);
      }
    } catch (apiError) {
      console.error('Chyba při volání OpenAI API:');
      console.error('Error name:', apiError.name);
      console.error('Error message:', apiError.message);
      if (apiError.response) {
        console.error('Status:', apiError.response.status);
        console.error('Data:', apiError.response.data);
      }
    }
  } catch (error) {
    console.error('Obecná chyba:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Spuštění testu
testApi(); 