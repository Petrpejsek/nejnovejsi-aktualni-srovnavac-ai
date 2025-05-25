/**
 * Skript pro aktualizaci doporučovacího systému AI nástrojů
 * 
 * Tento skript:
 * 1. Opraví problematické produkty v databázi
 * 2. Exportuje produkty do JSON souboru
 * 3. Vytvoří nového asistenta OpenAI s nahraným souborem
 * 4. Otestuje funkčnost doporučení
 * 
 * Spuštění: node refresh-recommendations.js
 */

// Importujeme potřebné moduly a funkce
import { PrismaClient } from '@prisma/client';
import { getOrCreateAssistant } from './lib/uploadToOpenAI.js';
import { exportProductsToFile } from './lib/exportProducts.js';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

// Inicializace klientů
const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Konstanty
const DATA_DIR = path.join(process.cwd(), 'data');
const ASSISTANT_ID_PATH = path.join(DATA_DIR, 'assistant-id.txt');

/**
 * Oprava problematických produktů v databázi
 */
async function fixProblematicProducts() {
  console.log('=== KROK 1: OPRAVA PRODUKTŮ ===');
  
  try {
    // Najdeme problematický produkt
    console.log('Hledám problematický produkt s ID "8b1ad8a1-5afb-40d4-b11d-48c33b606723"...');
    const problematicProduct = await prisma.product.findUnique({
      where: {
        id: '8b1ad8a1-5afb-40d4-b11d-48c33b606723'
      }
    });
    
    if (problematicProduct) {
      console.log('Problematický produkt nalezen:', problematicProduct.name);
      
      // Opravíme JSON pole
      console.log('Opravuji JSON pole produktu...');
      
      // Bezpečné stringifikování JSON - pokud pole již je řetězec, vrátí ho, jinak ho převede na řetězec
      const safeStringify = (field) => {
        if (typeof field === 'string') {
          try {
            // Zkusíme parsovat, zda je to validní JSON
            JSON.parse(field);
            // Pokud ano, vrátíme původní řetězec
            return field;
          } catch (e) {
            // Pokud ne, považujeme to za řetězec, který obalíme do JSON array
            return JSON.stringify([field]);
          }
        } else if (Array.isArray(field)) {
          // Pokud je to pole, převedeme ho na řetězec
          return JSON.stringify(field);
        } else if (field === null || field === undefined) {
          // Pokud je to null/undefined, vrátíme prázdné pole
          return JSON.stringify([]);
        } else {
          // Jiné typy - zkusíme stringifikovat jako je
          return JSON.stringify(field);
        }
      };
      
      // Opravíme produkt
      await prisma.product.update({
        where: {
          id: '8b1ad8a1-5afb-40d4-b11d-48c33b606723'
        },
        data: {
          tags: safeStringify(problematicProduct.tags || []),
          advantages: safeStringify(problematicProduct.advantages || []),
          disadvantages: safeStringify(problematicProduct.disadvantages || []),
          pricingInfo: typeof problematicProduct.pricingInfo === 'string' ? 
                      problematicProduct.pricingInfo : 
                      JSON.stringify(problematicProduct.pricingInfo || {}),
          videoUrls: safeStringify(problematicProduct.videoUrls || [])
        }
      });
      
      console.log('Problematický produkt opraven');
    } else {
      console.log('Problematický produkt nebyl nalezen');
    }
    
    // Zkontrolujeme další produkty na problémy s JSON
    console.log('Kontroluji další produkty na problémy s JSON formátem...');
    const allProducts = await prisma.product.findMany();
    
    let fixedProductsCount = 0;
    
    for (const product of allProducts) {
      let needsUpdate = false;
      const updates = {};
      
      // Funkce pro kontrolu a opravu JSON pole
      const checkAndFixJsonField = (fieldName, defaultValue = []) => {
        if (product[fieldName]) {
          try {
            if (typeof product[fieldName] === 'string') {
              // Zkusíme parsovat JSON
              JSON.parse(product[fieldName]);
              // Pokud se podařilo parsovat, je vše v pořádku
            } else {
              // Pokud to není řetězec, převedeme na JSON řetězec
              updates[fieldName] = JSON.stringify(product[fieldName]);
              needsUpdate = true;
            }
          } catch (e) {
            // Pokud parsování selže, opravíme pole
            console.log(`Problém s polem ${fieldName} u produktu ${product.id} (${product.name})`);
            updates[fieldName] = JSON.stringify(defaultValue);
            needsUpdate = true;
          }
        } else if (product[fieldName] === null) {
          // Pokud je pole null, nastavíme výchozí hodnotu
          updates[fieldName] = JSON.stringify(defaultValue);
          needsUpdate = true;
        }
      };
      
      // Zkontrolujeme všechna JSON pole
      checkAndFixJsonField('tags', []);
      checkAndFixJsonField('advantages', []);
      checkAndFixJsonField('disadvantages', []);
      checkAndFixJsonField('pricingInfo', {});
      checkAndFixJsonField('videoUrls', []);
      
      // Pokud je potřeba aktualizace, provedeme ji
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        });
        fixedProductsCount++;
      }
    }
    
    console.log(`Celkem opraveno ${fixedProductsCount} dalších produktů`);
  } catch (error) {
    console.error('Chyba při opravě produktů:', error);
    throw error;
  }
}

/**
 * Vytvoření nového vlákna pro komunikaci s asistentem
 */
async function createThread() {
  console.log('Vytvářím nové vlákno...');
  const thread = await openai.beta.threads.create();
  console.log(`Vlákno vytvořeno, ID: ${thread.id}`);
  return thread.id;
}

/**
 * Přidání zprávy do vlákna
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
 * Spuštění asistenta a čekání na dokončení běhu
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
 * Získání zpráv z vlákna
 */
async function getMessages(threadId) {
  console.log(`Získávám zprávy z vlákna ${threadId}...`);
  const messages = await openai.beta.threads.messages.list(threadId);
  console.log(`Získáno ${messages.data.length} zpráv`);
  return messages.data;
}

/**
 * Zpracování odpovědi od asistenta
 */
function processAssistantResponse(content) {
  console.log('Zpracovávám odpověď asistenta...');
  
  try {
    // Pokusíme se extrahovat JSON ze zprávy
    console.log('Originální odpověď:', content);
    
    // Někdy může asistent přidat Markdown značky nebo jiný text, takže se pokusíme najít JSON
    let jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    
    if (jsonMatch) {
      // Našli jsme JSON v Markdown bloku
      console.log('Nalezen JSON v Markdown bloku');
      content = jsonMatch[1];
    } else {
      // Pokusíme se najít JSON mimo Markdown
      jsonMatch = content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        console.log('Nalezen JSON mimo Markdown');
        content = jsonMatch[1];
      }
    }
    
    // Parse JSON
    const data = JSON.parse(content);
    
    // Zkontrolujeme, zda odpověď obsahuje doporučení
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      console.error('Odpověď neobsahuje validní pole doporučení');
      return [];
    }
    
    console.log(`Nalezeno ${data.recommendations.length} doporučení`);
    return data.recommendations;
  } catch (error) {
    console.error('Chyba při zpracování odpovědi:', error);
    console.error('Nelze parsovat JSON z odpovědi:', content);
    return [];
  }
}

/**
 * Otestování asistenta
 */
async function testAssistant(assistantId) {
  console.log('=== KROK 3: TESTOVÁNÍ ASISTENTA ===');
  
  try {
    // Vytvořit nové vlákno
    const threadId = await createThread();
    
    // Testovací dotaz
    const userQuery = "Potřebuji nástroj pro generování kvalitních textů na web a do emailů, který by měl podporovat češtinu a mít funkce pro optimalizaci pro SEO.";
    
    // Přidat zprávu do vlákna
    await addMessage(threadId, userQuery);
    
    // Spustit asistenta
    await runAssistant(assistantId, threadId);
    
    // Získat odpovědi
    const messages = await getMessages(threadId);
    
    // Zpracovat poslední odpověď od asistenta
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      console.error('Asistent neodpověděl.');
      return false;
    }
    
    const latestMessage = assistantMessages[0];
    console.log('Poslední odpověď od asistenta:');
    
    // Zpracovat obsah zprávy
    if (latestMessage.content && latestMessage.content.length > 0) {
      const messageContent = latestMessage.content[0];
      
      if (messageContent.type === 'text') {
        const recommendations = processAssistantResponse(messageContent.text.value);
        
        console.log('\nZpracovaná doporučení:');
        recommendations.forEach((rec, index) => {
          console.log(`\n[${index + 1}] Produkt ID: ${rec.id}`);
          console.log(`   Shoda: ${rec.matchPercentage}%`);
          console.log(`   Doporučení: ${rec.recommendation}`);
        });
        
        return recommendations.length > 0;
      } else {
        console.error('Neočekávaný typ obsahu:', messageContent.type);
        return false;
      }
    } else {
      console.error('Prázdná odpověď od asistenta');
      return false;
    }
  } catch (error) {
    console.error('Chyba při testování asistenta:', error);
    return false;
  }
}

/**
 * Hlavní funkce
 */
async function refreshRecommendations() {
  console.log('=== ZAHÁJENÍ AKTUALIZACE DOPORUČOVACÍHO SYSTÉMU ===');
  
  try {
    // Krok 1: Opravit problematické produkty
    await fixProblematicProducts();
    
    // Krok 2: Exportovat produkty a vytvořit asistenta
    console.log('\n=== KROK 2: VYTVOŘENÍ ASISTENTA ===');
    const assistantId = await getOrCreateAssistant();
    console.log(`Asistent vytvořen/aktualizován, ID: ${assistantId}`);
    
    // Krok 3: Otestovat asistenta
    const testResult = await testAssistant(assistantId);
    
    if (testResult) {
      console.log('\n=== AKTUALIZACE ÚSPĚŠNĚ DOKONČENA ===');
      console.log('Doporučovací systém je nyní funkční a používá aktuální data z databáze.');
    } else {
      console.error('\n=== AKTUALIZACE DOKONČENA S CHYBAMI ===');
      console.error('Test doporučení selhal. Zkontrolujte logy pro více informací.');
    }
  } catch (error) {
    console.error('Chyba při aktualizaci doporučovacího systému:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Spustit aktualizaci
refreshRecommendations(); 