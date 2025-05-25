import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = 'asst_unwHSr7Dqc1odJLkbdtAzRbo';

async function debugAssistantCommunication() {
  try {
    console.log('🔍 DEBUG: Testování komunikace s asistentem');
    console.log('🔍 Assistant ID:', ASSISTANT_ID);
    console.log('🔍 API Key končí na:', process.env.OPENAI_API_KEY?.slice(-4));
    
    // Test 1: Získání informací o asistentovi
    console.log('\n=== TEST 1: Informace o asistentovi ===');
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
    console.log('Název asistenta:', assistant.name);
    console.log('Model:', assistant.model);
    console.log('Instrukce (prvních 200 znaků):', assistant.instructions?.substring(0, 200) + '...');
    console.log('Nástroje:', assistant.tools?.map(t => t.type));
    console.log('File IDs:', assistant.file_ids?.length || 0, 'souborů');
    
    // Test 2: Vytvoření threadu a odeslání zprávy
    console.log('\n=== TEST 2: Vytvoření threadu ===');
    const thread = await openai.beta.threads.create();
    console.log('Thread ID:', thread.id);
    
    // Test 3: Odeslání zprávy - PŘESNĚ stejně jako v aplikaci
    console.log('\n=== TEST 3: Odeslání zprávy ===');
    const query = 'i need to solve marketing';
    console.log('Dotaz:', query);
    
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: query
    });
    console.log('Zpráva odeslána');
    
    // Test 4: Spuštění asistenta - PŘESNĚ stejně jako v aplikaci
    console.log('\n=== TEST 4: Spuštění asistenta ===');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
      tool_choice: 'none'
    });
    console.log('Run ID:', run.id);
    
    // Test 5: Čekání na odpověď
    console.log('\n=== TEST 5: Čekání na odpověď ===');
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    const startTime = Date.now();
    const MAX_WAIT = 30000; // 30s
    
    while ((runStatus.status === 'queued' || runStatus.status === 'in_progress') && (Date.now() - startTime) < MAX_WAIT) {
      const waitedMs = Date.now() - startTime;
      console.log(`⏳ Status: ${runStatus.status}, waited: ${waitedMs}ms`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    
    console.log('🎯 Finální status:', runStatus.status);
    console.log('🎯 Celkový čas:', Date.now() - startTime, 'ms');
    
    if (runStatus.status !== 'completed') {
      console.error('❌ Run se nedokončil správně!');
      console.error('Status:', runStatus.status);
      console.error('Last error:', runStatus.last_error);
      return;
    }
    
    // Test 6: Získání odpovědi
    console.log('\n=== TEST 6: Získání odpovědi ===');
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find(m => m.role === 'assistant');
    
    if (!lastMessage) {
      console.error('❌ Žádná odpověď od asistenta!');
      return;
    }
    
    console.log('✅ Odpověď nalezena');
    console.log('Message ID:', lastMessage.id);
    console.log('Content blocks:', lastMessage.content.length);
    
    const textBlock = lastMessage.content.find(block => block.type === 'text');
    if (!textBlock) {
      console.error('❌ Žádný textový blok v odpovědi!');
      return;
    }
    
    const response = textBlock.text.value;
    console.log('Odpověď (prvních 500 znaků):', response.substring(0, 500));
    
    // Test 7: Parsování JSON
    console.log('\n=== TEST 7: Parsování JSON ===');
    try {
      let jsonText = response;
      
      // Pokud obsahuje markdown bloky
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
        console.log('✅ Nalezen JSON v markdown bloku');
      }
      
      // Pokud začíná/končí nějakým textem
      const pureJsonMatch = response.match(/(\{[\s\S]*\})/);
      if (pureJsonMatch && !jsonMatch) {
        jsonText = pureJsonMatch[1];
        console.log('✅ Extrahován čistý JSON');
      }
      
      const data = JSON.parse(jsonText);
      console.log('✅ JSON úspěšně parsován');
      console.log('Počet doporučení:', data.recommendations?.length || 0);
      
      if (data.recommendations && data.recommendations.length > 0) {
        console.log('🎉 ÚSPĚCH! Asistent vrátil doporučení:');
        data.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ID: ${rec.id}, Match: ${rec.matchPercentage}%`);
        });
      } else {
        console.log('❌ Asistent vrátil prázdné doporučení');
        console.log('Celá odpověď:', response);
      }
      
    } catch (parseError) {
      console.error('❌ Chyba při parsování JSON:', parseError.message);
      console.error('Odpověď:', response);
    }
    
  } catch (error) {
    console.error('❌ Chyba při testování:', error);
  }
}

debugAssistantCommunication(); 