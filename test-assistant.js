/**
 * Jednoduchý testovací skript pro OpenAI asistenta
 *
 * Tento skript používá OpenAI API pro testování asistenta s novými instrukcemi
 */

// Načtení závislostí
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Načtení API klíče z .env souboru
const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envFile.match(/OPENAI_API_KEY="([^"]+)"/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

console.log('OpenAI API klíč je načtený:', apiKey ? 'Ano (klíč končí na: ' + apiKey.slice(-4) + ')' : 'Ne');

// Vytvoření klienta
const openai = new OpenAI({
  apiKey: apiKey,
});

// Cesta k souboru s ID asistenta
const ASSISTANT_ID_PATH = path.join(process.cwd(), 'data', 'assistant-id.txt');

/**
 * Vytvoří nové vlákno pro komunikaci s asistentem
 */
async function createThread() {
  console.log('Vytvářím nové vlákno...');
  const thread = await openai.beta.threads.create();
  console.log(`Vlákno vytvořeno, ID: ${thread.id}`);
  return thread.id;
}

/**
 * Přidá zprávu do vlákna
 */
async function addMessage(threadId, content) {
  console.log(`Přidávám zprávu do vlákna ${threadId}...`);
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content
  });
  console.log('Zpráva přidána');
}

/**
 * Spustí asistenta a čeká na dokončení běhu
 */
async function runAssistant(assistantId, threadId) {
  console.log(`Spouštím asistenta ${assistantId} na vlákně ${threadId}...`);
  
  // Spustit asistenta
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId
  });
  
  console.log(`Běh spuštěn, ID: ${run.id}, stav: ${run.status}`);
  
  // Čekat na dokončení běhu
  let currentRun = run;
  while (currentRun.status !== 'completed' && 
         currentRun.status !== 'failed' && 
         currentRun.status !== 'cancelled' && 
         currentRun.status !== 'expired') {
    console.log(`Čekám na dokončení běhu, aktuální stav: ${currentRun.status}...`);
    
    // Počkat 1 sekundu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Zkontrolovat aktuální stav
    currentRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }
  
  console.log(`Běh dokončen se stavem: ${currentRun.status}`);
  return currentRun;
}

/**
 * Získá zprávy z vlákna
 */
async function getMessages(threadId) {
  console.log(`Získávám zprávy z vlákna ${threadId}...`);
  const messages = await openai.beta.threads.messages.list(threadId);
  console.log(`Získáno ${messages.data.length} zpráv`);
  return messages.data;
}

/**
 * Otestuje asistenta s různými dotazy
 */
async function testAssistant() {
  console.log('=== TESTOVÁNÍ ASISTENTA: ZAČÁTEK ===');
  
  try {
    // Načteme existující ID asistenta
    if (!fs.existsSync(ASSISTANT_ID_PATH)) {
      console.error('Soubor s ID asistenta neexistuje. Nejprve je potřeba vytvořit asistenta.');
      return;
    }
    
    const assistantId = fs.readFileSync(ASSISTANT_ID_PATH, 'utf-8').trim();
    if (!assistantId) {
      console.error('ID asistenta nebylo nalezeno v souboru.');
      return;
    }
    
    console.log(`Používám asistenta s ID: ${assistantId}`);
    
    // Testovací dotazy v různých jazycích
    const testQueries = [
      {
        language: "Čeština",
        query: "Potřebuji nástroj pro generování obrázků a úpravu fotek"
      },
      {
        language: "Angličtina",
        query: "I need a tool for text generation and content creation"
      }
    ];
    
    for (const test of testQueries) {
      console.log(`\n--- Test: ${test.language} ---`);
      console.log(`Dotaz: "${test.query}"`);
      
      // Vytvořit nové vlákno
      const threadId = await createThread();
      
      // Přidat zprávu do vlákna
      await addMessage(threadId, test.query);
      
      // Spustit asistenta
      await runAssistant(assistantId, threadId);
      
      // Získat odpovědi
      const messages = await getMessages(threadId);
      
      // Zpracovat poslední odpověď od asistenta
      const assistantMessages = messages.filter(m => m.role === 'assistant');
      
      if (assistantMessages.length === 0) {
        console.error('Asistent neodpověděl.');
        continue;
      }
      
      const latestMessage = assistantMessages[0];
      
      // Zpracovat obsah zprávy
      if (latestMessage.content && latestMessage.content.length > 0) {
        const messageContent = latestMessage.content[0];
        
        if (messageContent.type === 'text') {
          console.log('Odpověď asistenta:');
          console.log(messageContent.text.value);
          
          try {
            // Zkusíme odpověď parsovat jako JSON
            const data = JSON.parse(messageContent.text.value);
            console.log(`\nPočet doporučení: ${data.recommendations?.length || 0}`);
            
            if (data.recommendations && data.recommendations.length > 0) {
              // Vypsat prvních 2-3 doporučení
              const limitedRecs = data.recommendations.slice(0, 3);
              limitedRecs.forEach((rec, index) => {
                console.log(`\nDoporučení ${index + 1}:`);
                console.log(`ID: ${rec.id}`);
                console.log(`Shoda: ${rec.matchPercentage}%`);
                console.log(`Text: ${rec.recommendation}`);
              });
            }
          } catch (error) {
            console.error('Chyba při parsování JSON:', error);
          }
        } else {
          console.error('Neočekávaný typ obsahu:', messageContent.type);
        }
      } else {
        console.error('Prázdná odpověď od asistenta');
      }
    }
    
    console.log('\n=== TESTOVÁNÍ ASISTENTA: DOKONČENO ===');
  } catch (error) {
    console.error('Chyba při testování asistenta:', error);
  }
}

// Spuštění testování
testAssistant(); 