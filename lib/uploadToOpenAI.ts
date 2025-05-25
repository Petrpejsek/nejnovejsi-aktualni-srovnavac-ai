import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { exportProductsToFile } from './exportProducts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ověříme, že API klíč je načtený
console.log('OpenAI API klíč je načtený (Upload):', process.env.OPENAI_API_KEY ? 'Ano (klíč končí na: ' + process.env.OPENAI_API_KEY.slice(-4) + ')' : 'Ne');

// Vytváříme OpenAI klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cesta k souboru s ID asistenta
const ASSISTANT_ID_PATH = path.join(process.cwd(), 'data', 'assistant-id.txt');

/**
 * Nahraje JSON soubor s produkty do OpenAI a vytvoří asistenta s nástrojem file_search
 * @returns {Promise<string>} ID vytvořeného asistenta
 */
export async function uploadProductsAndCreateAssistant(): Promise<string> {
  console.log('=== Upload do OpenAI: Začátek nahrávání ===');
  
  try {
    // Nejprve exportujeme produkty do souboru
    console.log('Upload do OpenAI: Exportuji produkty do souboru...');
    const filePath = await exportProductsToFile();
    
    // Získáme seznam produktů pro instrukce
    console.log('Upload do OpenAI: Načítám seznam produktů pro instrukce...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true
      }
    });
    
    // Nahrajeme soubor do OpenAI
    console.log('Upload do OpenAI: Nahrávám soubor s produkty do OpenAI...');
    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });
    
    console.log(`Upload do OpenAI: Soubor s produkty nahrán, ID: ${file.id}`);
    
    // Vytvoříme asistenta s nástrojem file_search
    console.log('Upload do OpenAI: Vytvářím nového asistenta...');
    const assistant = await openai.beta.assistants.create({
      name: "Product Recommendation Assistant",
      description: "Asistent pro doporučování AI nástrojů na základě dotazu uživatele",
      instructions: `
      Jsi odborný asistent napojený na vyhledávač a srovnávač AI nástrojů. Dotazy od uživatele dostáváš přes API. Máš přístup k databázi nástrojů přes file_search tool. Nikdy nesmíš doporučit nástroj, který není v této databázi.

      HLAVNÍ PRAVIDLA:

      1. Výběr nástrojů provádíš VÝHRADNĚ z databáze, která je ti dostupná přes file_search tool. Nikdy nesmíš generovat ani zmiňovat smyšlené produkty.
      2. Ke každému doporučenému nástroji urči procentuální shodu (matchPercentage) na základě relevance dotazu (v rozmezí 82–99 %).
      3. Doporučení musí být personalizované (2–3 věty), na základě konkrétního dotazu a vlastností nástroje.
      4. Jazyk odpovědi se automaticky přizpůsobuje jazyku dotazu. Pokud je dotaz v češtině, odpovídej česky. Pokud ve španělštině, odpovídej španělsky atd.
      5. Výsledky seřaď podle matchPercentage od nejvyššího po nejnižší.
      6. Není stanoven žádný pevný počet doporučení – můžeš vrátit libovolný počet relevantních nástrojů.
      7. Pokud žádný nástroj nemá shodu alespoň 82 %, vrať prázdné pole recommendations.
      8. MŮŽEŠ POUŽÍVAT POUZE ID PRODUKTŮ ZE SEZNAMU NÍŽE. ŽÁDNÁ JINÁ ID NEJSOU PLATNÁ.

      ROZSAH SHODY:

      - 92–99 % → vynikající shoda
      - 87–91 % → velmi dobrá shoda
      - 82–86 % → potenciálně užitečný nástroj

      POVINNÝ VÝSTUPNÍ FORMÁT:

      Tvoje odpověď musí být výhradně v JSON formátu, bez jakéhokoliv dalšího textu (žádné nadpisy, žádné komentáře, žádné úvodní věty).

      Formát výstupu:

      {
        "recommendations": [
          {
            "id": "ID produktu z databáze",
            "matchPercentage": 97,
            "recommendation": "Personalizované doporučení ve stejném jazyce jako dotaz."
          },
          {
            "id": "Další ID produktu z databáze",
            "matchPercentage": 94,
            "recommendation": "Další personalizované doporučení."
          }
        ]
      }

      Pokud není k dispozici žádný vhodný nástroj:

      {
        "recommendations": []
      }

      DŮLEŽITÉ:
      - ID každého nástroje MUSÍ být z následujícího seznamu platných ID. ŽÁDNÁ JINÁ ID NEJSOU POVOLENA.
      - Nikdy nesmíš používat smyšlená nebo generická ID (jako např. "tool-1", "tool-2").
      - Nikdy neodpovídej v jiném než výše uvedeném JSON formátu.

      SEZNAM PLATNÝCH ID PRODUKTŮ:
      ${products.map(p => `- ID: ${p.id}, Název: ${p.name}`).join('\n')}
      `,
      model: "gpt-4-turbo",
      tools: [{ type: "file_search" }],
      response_format: { type: "json_object" }
    });
    
    // Uložíme ID asistenta do souboru
    console.log(`Upload do OpenAI: Asistent vytvořen, ID: ${assistant.id}`);
    fs.writeFileSync(ASSISTANT_ID_PATH, assistant.id);
    
    console.log('Upload do OpenAI: Proces nahrávání a vytvoření asistenta dokončen');
    return assistant.id;
  } catch (error) {
    console.error('Upload do OpenAI: Chyba při nahrávání nebo vytváření asistenta:', error);
    throw error;
  }
}

/**
 * Získá ID asistenta, pokud existuje, jinak vytvoří nového asistenta
 * @returns {Promise<string>} ID asistenta
 */
export async function getOrCreateAssistant(): Promise<string> {
  try {
    // Pokusíme se načíst ID existujícího asistenta
    if (fs.existsSync(ASSISTANT_ID_PATH)) {
      const assistantId = fs.readFileSync(ASSISTANT_ID_PATH, 'utf-8').trim();
      
      if (assistantId) {
        try {
          // Ověříme, že asistent skutečně existuje
          await openai.beta.assistants.retrieve(assistantId);
          console.log(`Upload do OpenAI: Používám existujícího asistenta s ID: ${assistantId}`);
          return assistantId;
        } catch (error) {
          console.log('Upload do OpenAI: Existující asistent nebyl nalezen, vytvářím nového...');
        }
      }
    }
    
    // Pokud neexistuje nebo došlo k chybě, vytvoříme nového asistenta
    return await uploadProductsAndCreateAssistant();
  } catch (error) {
    console.error('Upload do OpenAI: Chyba při získávání nebo vytváření asistenta:', error);
    throw error;
  }
} 