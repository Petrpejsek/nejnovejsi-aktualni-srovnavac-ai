import { OpenAI } from 'openai';
import prisma from './prisma';

// Ověříme, že API klíč je načtený
console.log('OpenAI API klíč je načtený (Assistant):', process.env.OPENAI_API_KEY ? 'Ano (klíč končí na: ' + process.env.OPENAI_API_KEY.slice(-4) + ')' : 'Ne');

// Vytváříme OpenAI klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⭐ ID vašeho asistenta - nastavíme napevno
const ASSISTANT_ID = 'asst_unwHSr7Dqc1odJLkbdtAzRbo';

// Rozhraní pro doporučení
interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
}

export async function generateAssistantRecommendations(query: string) {
  try {
    console.log('🚀 AssistantRecommendations: START', { query });

    // Vytvoříme nový thread
    const thread = await openai.beta.threads.create();

    // Přidáme zprávu do threadu
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: query
    });

    // Spustíme asistenta
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Počkáme na odpověď
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    const startTime = Date.now();
    const MAX_WAIT = 45000; // 45 s - zvýšíme timeout
    
    while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && (Date.now() - startTime) < MAX_WAIT) {
      const elapsed = Date.now() - startTime;
      console.log(`AssistantRecommendations: ⏳ Status: ${runStatus.status}, waited: ${elapsed}ms/${MAX_WAIT}ms`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Zvýšíme interval na 1s
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    
    const aiTime = Date.now() - startTime;
    console.log(`AssistantRecommendations: 🎯 AI dokončeno! Čas: ${aiTime}ms (${(aiTime/1000).toFixed(1)}s), status: ${runStatus.status}`);
    
    if (runStatus.status !== 'completed') {
      console.error(`AssistantRecommendations: ❌ Selhání po ${aiTime}ms, status: ${runStatus.status}`);
      
      // Pokud je status 'failed', zkusíme získat error detaily
      if (runStatus.status === 'failed') {
        console.error('❌ Run failed details:', runStatus.last_error);
      }
      
      return [];
    }

    // Získáme odpověď
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find(m => m.role === 'assistant') || messages.data[0];
    
    // Najdeme blok typu text
    const textBlock = lastMessage.content.find(block => block.type === 'text');
    const response = textBlock ? textBlock.text.value : '';
    
    console.log('🔍 ODPOVĚĎ OD AI ASISTENTA:');
    console.log('Raw response:', response);
    console.log('Response length:', response.length);

    // Zkusíme parsovat JSON
    try {
      let jsonText = response;
      
      // Pokud obsahuje markdown bloky ```json
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      // Pokud začíná/končí nějakým textem, najdeme jen JSON část
      const pureJsonMatch = response.match(/(\{[\s\S]*\})/);
      if (pureJsonMatch && !jsonMatch) {
        jsonText = pureJsonMatch[1];
      }
      
      const data = JSON.parse(jsonText);
      let recommendations: Recommendation[] = data.recommendations || [];

      // Validace ID proti databázi
      
      const existingProducts = await prisma.product.findMany({
        where: {
          id: {
            in: recommendations.map(r => r.id)
          }
        },
        select: {
          id: true,
          name: true
        }
      });

      // Vytvoříme Set existujících ID pro rychlé vyhledávání
      const existingIds = new Set(existingProducts.map(p => p.id));

      // Filtrujeme pouze doporučení s existujícími ID
      const validRecs = recommendations.filter(rec => {
        const exists = existingIds.has(rec.id);
        if (!exists) {
          console.log('⚠️ ID neexistuje v databázi:', rec.id);
        }
        return exists;
      });

      console.log(`✅ Validní doporučení: ${validRecs.length}/${recommendations.length}`);
      
      return validRecs;
    } catch (e) {
      console.error('Chyba při parsování odpovědi:', e);
      return [];
    }
  } catch (e) {
    console.error('AssistantRecommendations: Chyba při komunikaci s OpenAI:', e);
    return [];
  }
} 