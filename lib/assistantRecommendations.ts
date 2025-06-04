import { OpenAI } from 'openai';
import prisma from './prisma';

// Verify that API key is loaded
console.log('OpenAI API key loaded (Chat):', process.env.OPENAI_API_KEY ? 'Yes (key ends with: ' + process.env.OPENAI_API_KEY.slice(-4) + ')' : 'No');

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zkrácený system prompt pro rychlost
const TOOLFINDER_PROMPT = `Najdi 1-3 nejvhodnější AI nástroje pro uživatelský dotaz. Vrať POUZE JSON:
{
  "recommendations": [
    {
      "id": "ID_nástroje",
      "match_percentage": 85,
      "reason": "Proč je vhodný"
    }
  ]
}`;

export async function generateAssistantRecommendations(query: string) {
  try {
    console.log('🔍 Generating recommendations for:', query);
    const startTime = Date.now();

    // 1. Načti všechny produkty z databáze
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        category: true,
        price: true
      }
    });

    console.log(`📦 Loaded ${products.length} products for AI`);

    // 2. Vytvoř kompaktní databázi pro AI (zkrácené popisy)
    const productDatabase = products.map(p => {
      // Zkrať popis na max 100 znaků
      const shortDescription = p.description && p.description.length > 100 
        ? p.description.substring(0, 100) + '...' 
        : p.description;
      
      return `${p.id}|${p.name}|${shortDescription}|${p.category}|${p.tags}|${p.price}`;
    }).join('\n');

    // 3. Zavolej Chat Completions API
    console.log('🤖 Calling OpenAI Chat Completions API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: TOOLFINDER_PROMPT
        },
        {
          role: "user",
          content: `Databáze (ID|Název|Popis|Kategorie|Tags|Cena):\n${productDatabase}\n\nDotaz: ${query}`
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    const responseText = completion.choices[0]?.message?.content;
    console.log('📝 AI Response:', responseText);

    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // 4. Parsuj JSON odpověď
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      // Fallback - zkus najít JSON v textu
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // 5. Validuj a připrav finální doporučení
    const validRecommendations = [];
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const rec of aiResponse.recommendations || []) {
      const product = productMap.get(rec.id);
      if (product) {
        validRecommendations.push({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          tags: product.tags,
          price: product.price,
          match_percentage: rec.match_percentage || 75,
          reason: rec.reason || 'Doporučeno AI asistentem'
        });
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Generated ${validRecommendations.length} recommendations in ${processingTime}ms`);

    return validRecommendations;

  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    throw error;
  }
} 