/**
 * Skript pro aktualizaci asistenta na OpenAI s novými instrukcemi
 * 
 * Tento skript:
 * 1. Aktualizuje instrukce pro OpenAI asistenta
 * 2. Exportuje produkty do JSON souboru pro asistenta
 * 3. Nahraje soubor do OpenAI a aktualizuje/vytvoří asistenta
 */

// Načtení závislostí
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

// Inicializace Prisma klienta
const prisma = new PrismaClient();

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
const DATA_DIR = path.join(process.cwd(), 'data');
const ASSISTANT_ID_PATH = path.join(DATA_DIR, 'assistant-id.txt');

/**
 * Exportuje produkty z databáze do JSON souboru
 */
async function exportProductsToFile() {
  console.log('=== Export produktů: Začátek exportu ===');
  
  try {
    // Získáme všechny produkty z databáze
    console.log('Export produktů: Načítám produkty z databáze...');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        tags: true,
        advantages: true,
        disadvantages: true,
        pricingInfo: true,
        videoUrls: true,
        detailInfo: true,
        imageUrl: true,
        externalUrl: true,
        hasTrial: true
      }
    });
    
    console.log(`Export produktů: Načteno ${products.length} produktů z databáze`);
    
    // Zpracujeme produkty, abychom předešli problémům s JSON formátem
    console.log('Export produktů: Zpracovávám produkty...');
    const processedProducts = products.map(product => {
      try {
        // Přeskočíme problematický produkt
        if (product.id === '8b1ad8a1-5afb-40d4-b11d-48c33b606723') {
          console.log(`Export produktů: Speciální zpracování problematického produktu ${product.id}`);
          return {
            ...product,
            tags: [],
            advantages: [],
            disadvantages: [],
            pricingInfo: {},
            videoUrls: []
          };
        }
        
        // Bezpečné parsování JSON polí
        const safelyParse = (field, defaultValue) => {
          if (!field) return defaultValue;
          if (typeof field !== 'string') return field;
          try {
            return JSON.parse(field);
          } catch (e) {
            console.warn(`Export produktů: Chyba při parsování pole u produktu ${product.id}:`, e);
            return defaultValue;
          }
        };
        
        return {
          ...product,
          tags: safelyParse(product.tags, []),
          advantages: safelyParse(product.advantages, []),
          disadvantages: safelyParse(product.disadvantages, []),
          pricingInfo: safelyParse(product.pricingInfo, {}),
          videoUrls: safelyParse(product.videoUrls, [])
        };
      } catch (error) {
        console.error(`Export produktů: Chyba při zpracování produktu ${product.id}:`, error);
        // Při chybě vrátíme produkt s prázdnými hodnotami
        return {
          ...product,
          tags: [],
          advantages: [],
          disadvantages: [],
          pricingInfo: {},
          videoUrls: []
        };
      }
    });
    
    // Vytvoříme složku data, pokud neexistuje
    if (!fs.existsSync(DATA_DIR)) {
      console.log('Export produktů: Vytvářím složku data...');
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Vytvoříme JSON soubor s produkty
    const filePath = path.join(DATA_DIR, 'products.json');
    console.log(`Export produktů: Ukládám produkty do souboru ${filePath}...`);
    
    // Uložíme JSON soubor (pretty-print pro čitelnost)
    fs.writeFileSync(filePath, JSON.stringify(processedProducts, null, 2));
    
    console.log(`Export produktů: Export dokončen, vytvořen soubor ${filePath} s ${processedProducts.length} produkty`);
    return filePath;
  } catch (error) {
    console.error('Export produktů: Chyba při exportu produktů:', error);
    throw error;
  }
}

/**
 * Aktualizuje instrukce pro existujícího asistenta nebo vytvoří nového
 */
async function updateAssistant() {
  console.log('=== AKTUALIZACE ASISTENTA: ZAČÁTEK ===');
  
  try {
    // Exportujeme produkty do souboru
    console.log('Exportuji produkty do souboru...');
    const filePath = await exportProductsToFile();
    
    // Nahrajeme soubor do OpenAI
    console.log('Nahrávám soubor s produkty do OpenAI...');
    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });
    
    console.log(`Soubor s produkty nahrán, ID: ${file.id}`);
    
    // Zkontrolujeme, zda existuje asistent
    let assistantId = null;
    try {
      if (fs.existsSync(ASSISTANT_ID_PATH)) {
        assistantId = fs.readFileSync(ASSISTANT_ID_PATH, 'utf-8').trim();
        
        if (assistantId) {
          // Ověříme, že asistent existuje
          try {
            await openai.beta.assistants.retrieve(assistantId);
            console.log(`Existující asistent nalezen, ID: ${assistantId}`);
          } catch (error) {
            console.log('Existující asistent nebyl nalezen, vytvářím nového...');
            assistantId = null;
          }
        }
      }
    } catch (error) {
      console.error('Chyba při kontrole existujícího asistenta:', error);
      assistantId = null;
    }
    
    // Nové instrukce pro asistenta
    const newInstructions = `
Jsi odborný asistent napojený na vyhledávač a srovnávač AI nástrojů. Dotazy od uživatele dostáváš přes API. Máš přístup pouze k databázi nástrojů, která byla exportována a poskytnuta při integraci. Nikdy nesmíš doporučit nástroj, který není v této databázi.

HLAVNÍ PRAVIDLA:

1. Výběr nástrojů provádíš výhradně z databáze, která je ti dostupná. Nikdy nesmíš generovat ani zmiňovat smyšlené produkty.
2. Ke každému doporučenému nástroji urči procentuální shodu (matchPercentage) na základě relevance dotazu (v rozmezí 82–99 %).
3. Doporučení musí být personalizované (2–3 věty), na základě konkrétního dotazu a vlastností nástroje.
4. VŽDY odpovídej POUZE v angličtině, bez ohledu na jazyk dotazu. Všechna doporučení musí být v angličtině.
5. Výsledky seřaď podle matchPercentage od nejvyššího po nejnižší.
6. Není stanoven žádný pevný počet doporučení – můžeš vrátit libovolný počet relevantních nástrojů.
7. Pokud žádný nástroj nemá shodu alespoň 82 %, vrať prázdné pole recommendations.

ROZSAH SHODY:

- 92–99 % → vynikající shoda
- 87–91 % → velmi dobrá shoda
- 82–86 % → potenciálně užitečný nástroj

POVINNÝ VÝSTUPNÍ FORMÁT:

Tvoje odpověď musí být výhradně v JSON formátu, bez jakéhokoliv dalšího textu (žádné nadpisy, žádný Markdown, žádné komentáře, žádné úvodní věty). Odpověď MUSÍ začínat znakem '{' a končit znakem '}' - NIKDY nepoužívej markdown blok kódu (\`\`\`json) ani jiné formátování.

Formát výstupu:

{
  "recommendations": [
    {
      "id": "a8196ba8-6c89-4259-aca0-fbab388b201c",
      "matchPercentage": 97,
      "recommendation": "Personalized recommendation in English explaining why this tool is perfect for your needs."
    },
    {
      "id": "b7d45e2c-f138-42e1-9a91-2d78af8ed323",
      "matchPercentage": 94,
      "recommendation": "Another personalized recommendation."
    }
  ]
}

Pokud není k dispozici žádný vhodný nástroj:

{
  "recommendations": []
}

DŮLEŽITÉ:
- ID každého nástroje musí odpovídat přesně tomu, které je uvedeno v databázi (ve formátu UUID, např. "a8196ba8-6c89-4259-aca0-fbab388b201c").
- Nikdy nesmíš používat smyšlená nebo generická ID (jako "tool-1", "nástroj-2", apod.). Vždy použij skutečné ID z databáze.
- Nikdy neodpovídej v jiném než výše uvedeném JSON formátu.
    `;
    
    // Aktualizujeme nebo vytvoříme asistenta
    let assistant;
    if (assistantId) {
      // Aktualizace existujícího asistenta
      console.log('Aktualizuji existujícího asistenta...');
      assistant = await openai.beta.assistants.update(assistantId, {
        instructions: newInstructions,
        tools: [{ type: "file_search" }],
        file_ids: [file.id],
        model: "gpt-4-turbo",
        response_format: { type: "json_object" }
      });
      console.log('Asistent byl úspěšně aktualizován');
    } else {
      // Vytvoření nového asistenta
      console.log('Vytvářím nového asistenta...');
      assistant = await openai.beta.assistants.create({
        name: "Product Recommendation Assistant",
        description: "Asistent pro doporučování AI nástrojů na základě dotazu uživatele",
        instructions: newInstructions,
        model: "gpt-4-turbo",
        tools: [{ type: "file_search" }],
        file_ids: [file.id],
        response_format: { type: "json_object" }
      });
      console.log('Nový asistent byl úspěšně vytvořen');
    }
    
    // Uložíme ID asistenta
    fs.writeFileSync(ASSISTANT_ID_PATH, assistant.id);
    console.log(`ID asistenta: ${assistant.id}`);
    
    console.log('=== AKTUALIZACE ASISTENTA: DOKONČENO ===');
    return assistant.id;
  } catch (error) {
    console.error('Chyba při aktualizaci asistenta:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Spustit aktualizaci
updateAssistant()
  .then(assistantId => {
    console.log(`Asistent byl úspěšně aktualizován s ID: ${assistantId}`);
    console.log('Pro otestování asistenta spusťte: node test-assistant.mjs');
  })
  .catch(error => {
    console.error('Chyba při aktualizaci asistenta:', error);
  }); 