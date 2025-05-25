import { OpenAI } from 'openai';
import prisma from './prisma';

// Verify that API key is loaded
console.log('OpenAI API key loaded (Assistant):', process.env.OPENAI_API_KEY ? 'Yes (key ends with: ' + process.env.OPENAI_API_KEY.slice(-4) + ')' : 'No');

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ⭐ Your assistant ID - set permanently
const ASSISTANT_ID = 'asst_unwHSr7Dqc1odJLkbdtAzRbo';

// Interface for recommendations
interface Recommendation {
  id: string;
  matchPercentage: number;
  recommendation: string;
}

export async function generateAssistantRecommendations(query: string) {
  try {
    console.log('🚀 AssistantRecommendations: START', { query });
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found');
      return [];
    }

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

    // Wait for response
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    const startTime = Date.now();
    const MAX_WAIT = 6000; // 6 seconds - Vercel timeout limit
    
    while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && (Date.now() - startTime) < MAX_WAIT) {
      const elapsed = Date.now() - startTime;
      console.log(`AssistantRecommendations: ⏳ Status: ${runStatus.status}, waited: ${elapsed}ms/${MAX_WAIT}ms`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Check every 500ms
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    
    const aiTime = Date.now() - startTime;
    console.log(`AssistantRecommendations: 🎯 AI completed! Time: ${aiTime}ms (${(aiTime/1000).toFixed(1)}s), status: ${runStatus.status}`);
    
    if (runStatus.status !== 'completed') {
      console.error(`AssistantRecommendations: ❌ Timeout after ${aiTime}ms, status: ${runStatus.status}`);
      
      // If status is 'failed', try to get error details
      if (runStatus.status === 'failed') {
        console.error('❌ Run failed details:', runStatus.last_error);
      }
      
      return [];
    }

    // Get response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find(m => m.role === 'assistant') || messages.data[0];
    
    // Find text block
    const textBlock = lastMessage.content.find(block => block.type === 'text');
    const response = textBlock ? textBlock.text.value : '';
    
    console.log('🔍 AI ASSISTANT RESPONSE:');
    console.log('Raw response:', response);
    console.log('Response length:', response.length);

    // Try to parse JSON
    try {
      let jsonText = response;
      
      // If contains markdown blocks ```json
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      // If starts/ends with some text, find only JSON part
      const pureJsonMatch = response.match(/(\{[\s\S]*\})/);
      if (pureJsonMatch && !jsonMatch) {
        jsonText = pureJsonMatch[1];
      }
      
      const data = JSON.parse(jsonText);
      let recommendations: Recommendation[] = data.recommendations || [];

      // Validate IDs against database
      
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

      // Create Set of existing IDs for fast lookup
      const existingIds = new Set(existingProducts.map(p => p.id));

      // Filter only recommendations with existing IDs
      const validRecs = recommendations.filter(rec => {
        const exists = existingIds.has(rec.id);
        if (!exists) {
          console.log('⚠️ ID does not exist in database:', rec.id);
        }
        return exists;
      });

      console.log(`✅ Valid recommendations: ${validRecs.length}/${recommendations.length}`);
      
      return validRecs;
    } catch (e) {
      console.error('Error parsing response:', e);
      return [];
    }
  } catch (e) {
    console.error('AssistantRecommendations: Error communicating with OpenAI:', e);
    return [];
  }
} 